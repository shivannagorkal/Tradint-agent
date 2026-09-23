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

// Full onboarding flow (User registration + Risk profile + Alpaca Paper credentials)
onboardingRouter.post(
  "/onboarding",
  validateBody(onboardingSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;

      const existing = await User.findOne({ email: data.email.toLowerCase() });
      if (existing) {
        res.status(409).json({ error: "User already exists with this email address." });
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await User.create({
        email: data.email.toLowerCase(),
        passwordHash,
        displayName: data.displayName,
        role: "user",
      });

      // Create Risk Profile
      const riskProfile = await RiskProfile.create({
        userId: user._id,
        riskCategory: data.riskCategory,
        allocatableCapital: data.allocatableCapital,
        maxPositionPct: data.maxPositionPct,
        maxDailyLossPct: data.maxDailyLossPct,
        liveTradingEnabled: false,
      });

      // Encrypt & Store Alpaca Paper Credentials
      const encryptedKey = encryptCredential(data.alpacaPaperKey);
      const encryptedSecret = encryptCredential(data.alpacaPaperSecret);

      await ApiCredential.create({
        userId: user._id,
        provider: "alpaca_paper",
        encryptedKey: encryptedKey.ciphertext,
        encryptedSecret: encryptedSecret.ciphertext,
        keyIv: encryptedKey.iv,
        keyAuthTag: encryptedKey.authTag,
      });

      // Initialize Kill Switch State
      await KillSwitchState.create({
        userId: user._id,
        isEngaged: false,
      });

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
