import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, RiskProfile, KillSwitchState } from "../db/models";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";
import { logAuditEvent } from "../services/auditLogger";

export const authRouter = Router();

// Register
authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      res.status(400).json({ error: "Missing required fields: email, password, displayName" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      role: "user",
    });

    // Initialize Kill Switch state
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
      eventType: "user_registered",
      entityType: "user",
      entityId: user._id.toString(),
      payload: { email: user.email },
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

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
      eventType: "user_login",
      entityType: "user",
      entityId: user._id.toString(),
      payload: { email: user.email },
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie(env.SESSION_COOKIE_NAME);
  res.json({ success: true, message: "Logged out successfully." });
});

// Current User Profile
authRouter.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const riskProfile = await RiskProfile.findOne({ userId: user._id });
    const killSwitch = await KillSwitchState.findOne({ userId: user._id });

    res.json({
      user,
      riskProfile,
      killSwitchEngaged: killSwitch?.isEngaged ?? false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
