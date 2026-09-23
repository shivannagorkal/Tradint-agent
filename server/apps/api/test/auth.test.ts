import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { requireRole } from "../src/middleware/roleGuard";
import { env } from "../src/config/env";

describe("Authentication & RBAC Middleware", () => {
  it("should generate and verify signed JWT tokens", () => {
    const payload = {
      id: "user-uuid-12345",
      email: "trader@example.com",
      role: "user" as const,
      displayName: "Pro Trader",
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" });
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, env.JWT_SECRET) as typeof payload;
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe("user");
  });

  it("should deny access when user role does not match required role", () => {
    const middleware = requireRole("admin");
    const req: any = { user: { id: "user-1", role: "user" } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Requires 'admin' role") })
    );
  });

  it("should grant access when user has the required admin role", () => {
    const middleware = requireRole("admin");
    const req: any = { user: { id: "admin-1", role: "admin" } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
