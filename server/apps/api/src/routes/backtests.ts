import { Router, Request, Response } from "express";
import { backtestRequestSchema } from "@confluence/shared-schemas";
import { Backtest } from "../db/models";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { AgentRuntimeClient } from "../services/agentRuntimeClient";
import { logAuditEvent } from "../services/auditLogger";

export const backtestsRouter = Router();

// Launch a new backtest & overfitting validation run
backtestsRouter.post(
  "/backtests",
  requireAuth,
  validateBody(backtestRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { strategyName, tickerUniverse, startDate, endDate } = req.body;

      // Create initial pending backtest record
      const backtest = await Backtest.create({
        userId: req.user!.id,
        strategyName,
        tickerUniverse,
        startDate,
        endDate,
        status: "running",
      });

      // Execute validation in background or microservice
      (async () => {
        try {
          const result = await AgentRuntimeClient.runBacktest(
            strategyName,
            tickerUniverse,
            startDate,
            endDate
          );

          await Backtest.findByIdAndUpdate(backtest._id, {
            sharpeRatio: result.sharpeRatio,
            deflatedSharpeRatio: result.deflatedSharpeRatio,
            probabilityOfBacktestOverfitting: result.probabilityOfBacktestOverfitting,
            maxDrawdownPct: result.maxDrawdownPct,
            isEligibleForPaperTrading: result.isEligibleForPaperTrading,
            status: "completed",
            completedAt: new Date(),
          });

          await logAuditEvent({
            userId: req.user!.id,
            eventType: "backtest_completed",
            entityType: "backtest",
            entityId: backtest._id.toString(),
            payload: {
              strategyName,
              sharpeRatio: result.sharpeRatio,
              deflatedSharpeRatio: result.deflatedSharpeRatio,
              pbo: result.probabilityOfBacktestOverfitting,
              eligible: result.isEligibleForPaperTrading,
            },
          });
        } catch (err: any) {
          await Backtest.findByIdAndUpdate(backtest._id, {
            status: "failed",
            completedAt: new Date(),
          });
        }
      })();

      res.status(202).json({
        message: "Backtest validation job launched.",
        backtestId: backtest._id,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// List user's backtests
backtestsRouter.get("/backtests", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await Backtest.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get backtest details by ID
backtestsRouter.get("/backtests/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const backtest = await Backtest.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!backtest) {
      res.status(404).json({ error: "Backtest not found." });
      return;
    }
    res.json(backtest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
