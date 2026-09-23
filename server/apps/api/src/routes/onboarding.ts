import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  onboardingSchema,
  updateRiskProfileSchema,
  confirmLiveTradingSchema,
} from "@confluence/shared-schemas";
import { User, RiskProfile, ApiCredential, KillSwitchState } from "../db/models";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { encryptCredential } from "../services/encryption";
import { logAuditEvent } from "../services/auditLogger";

export const onboardingRouter = Router();

// Full onboarding flow (User registration + Risk profile + Alpaca Paper credentials, or authenticated onboarding)
onboardingRouter.post(
  "/onboarding",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;

      // Check if user is already authenticated via session cookie or Authorization header
      let currentUser: any = null;
      const authToken =
        req.cookies?.[env.SESSION_COOKIE_NAME] ||
        req.headers.authorization?.replace(/^Bearer\s+/i, "");

      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, env.JWT_SECRET) as any;
          currentUser = await User.findById(decoded.id);
        } catch {
          // Token invalid, proceed with registration flow
        }
      }

      let user = currentUser;

      if (!user) {
        // Unauthenticated flow: require email, password, displayName
        if (!data.email || !data.password || !data.displayName) {
          res.status(400).json({ error: "Missing required registration fields: email, password, displayName." });
          return;
        }

        const existing = await User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
          // Check if password matches to allow onboarding for existing user
          const isMatch = await bcrypt.compare(data.password, existing.passwordHash);
          if (!isMatch) {
            res.status(409).json({ error: "User already exists with this email address." });
            return;
          }
          user = existing;
        } else {
          const passwordHash = await bcrypt.hash(data.password, 10);
          user = await User.create({
            email: data.email.toLowerCase(),
            passwordHash,
            displayName: data.displayName,
            role: "user",
          });
        }
      }

      // Create or Update Risk Profile
      const riskProfile = await RiskProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          riskCategory: data.riskCategory || "balanced",
          allocatableCapital: data.allocatableCapital || 10000,
          maxPositionPct: data.maxPositionPct || 10,
          maxDailyLossPct: data.maxDailyLossPct || 3,
          liveTradingEnabled: false,
        },
        { upsert: true, new: true }
      );

      // Encrypt & Store Alpaca Paper Credentials (if provided)
      if (data.alpacaPaperKey && data.alpacaPaperSecret) {
        const encryptedKey = encryptCredential(data.alpacaPaperKey);
        const encryptedSecret = encryptCredential(data.alpacaPaperSecret);

        await ApiCredential.findOneAndUpdate(
          { userId: user._id, provider: "alpaca_paper" },
          {
            userId: user._id,
            provider: "alpaca_paper",
            encryptedKey: encryptedKey.ciphertext,
            encryptedSecret: encryptedSecret.ciphertext,
            keyIv: encryptedKey.iv,
            keyAuthTag: encryptedKey.authTag,
          },
          { upsert: true }
        );
      }

      // Initialize Kill Switch State if not existing
      await KillSwitchState.findOneAndUpdate(
        { userId: user._id },
        { $setOnInsert: { userId: user._id, isEngaged: false } },
        { upsert: true }
      );

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role, displayName: user.displayName },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie(env.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAuditEvent({
        userId: user._id,
        eventType: "onboarding_completed",
        entityType: "risk_profile",
        entityId: riskProfile._id.toString(),
        payload: {
          riskCategory: data.riskCategory,
          capital: data.allocatableCapital,
          maxPositionPct: data.maxPositionPct,
        },
      });

      res.status(201).json({
        success: true,
        user: { id: user._id, email: user.email, displayName: user.displayName },
        riskProfile,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get current user's risk profile
onboardingRouter.get("/risk-profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await RiskProfile.findOne({ userId: req.user!.id });
    if (!profile) {
      res.status(404).json({ error: "Risk profile not found." });
      return;
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update risk profile parameters
onboardingRouter.put(
  "/risk-profile",
  requireAuth,
  validateBody(updateRiskProfileSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await RiskProfile.findOneAndUpdate(
        { userId: req.user!.id },
        { $set: req.body },
        { new: true }
      );

      await logAuditEvent({
        userId: req.user!.id,
        eventType: "risk_profile_updated",
        entityType: "risk_profile",
        payload: req.body,
      });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Live Trading Gate Confirmation
onboardingRouter.post(
  "/risk-profile/confirm-live-trading",
  requireAuth,
  validateBody(confirmLiveTradingSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { alpacaLiveKey, alpacaLiveSecret } = req.body;

      // Encrypt live credentials
      const encKey = encryptCredential(alpacaLiveKey);
      const encSec = encryptCredential(alpacaLiveSecret);

      await ApiCredential.findOneAndUpdate(
        { userId: req.user!.id, provider: "alpaca_live" },
        {
          userId: req.user!.id,
          provider: "alpaca_live",
          encryptedKey: encKey.ciphertext,
          encryptedSecret: encSec.ciphertext,
          keyIv: encKey.iv,
          keyAuthTag: encKey.authTag,
        },
        { upsert: true }
      );

      const profile = await RiskProfile.findOneAndUpdate(
        { userId: req.user!.id },
        {
          liveTradingEnabled: true,
          liveTradingConfirmedAt: new Date(),
        },
        { new: true }
      );

      await logAuditEvent({
        userId: req.user!.id,
        eventType: "live_trading_enabled",
        entityType: "risk_profile",
        payload: { confirmedAt: new Date() },
      });

      res.json({
        success: true,
        message: "Live trading successfully enabled with 24-hour expiration window.",
        riskProfile: profile,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);
