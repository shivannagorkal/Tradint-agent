import { Router, Request, Response } from "express";
import { proposalAdjustSchema } from "@confluence/shared-schemas";
import { TradeProposal, Order, RiskProfile } from "../db/models";
import { requireAuth } from "../middleware/auth";
import { requireKillSwitchDisengaged } from "../middleware/killSwitchGuard";
import { validateBody } from "../middleware/validate";
import { AlpacaService } from "../services/alpacaService";
import { broadcastOrderStatus } from "../websocket/socketServer";
import { logAuditEvent } from "../services/auditLogger";

export const proposalsRouter = Router();

// Get user's proposals
proposalsRouter.get("/proposals", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const filter: any = { userId: req.user!.id };
    if (status) {
      filter.status = status;
    }
    const proposals = await TradeProposal.find(filter).sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a proposal -> triggers broker order submission (Paper by default)
proposalsRouter.post(
  "/proposals/:id/approve",
  requireAuth,
  requireKillSwitchDisengaged,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const proposal = await TradeProposal.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!proposal) {
        res.status(404).json({ error: "Proposal not found." });
        return;
      }

      if (proposal.status !== "pending") {
        res.status(400).json({ error: `Cannot approve proposal with status: ${proposal.status}` });
        return;
      }

      // Check risk profile limits
      const riskProfile = await RiskProfile.findOne({ userId: req.user!.id });
      const quantity = proposal.suggestedQuantity || 1;

      // Submit order to Alpaca (defaults to Paper)
      const brokerResult = await AlpacaService.submitOrder({
        userId: req.user!.id,
        ticker: proposal.ticker,
        side: proposal.action,
        quantity,
        isPaper: !(riskProfile?.liveTradingEnabled ?? false),
      });

      // Create Order record
      const order = await Order.create({
        proposalId: proposal._id,
        userId: req.user!.id,
        brokerOrderId: brokerResult.brokerOrderId,
        ticker: proposal.ticker,
        side: proposal.action,
        quantity,
        orderType: "market",
        isPaper: brokerResult.isPaper,
        status: brokerResult.status,
        filledAvgPrice: brokerResult.filledAvgPrice,
      });

      // Update proposal status
      proposal.status = "approved";
      proposal.reviewedAt = new Date();
      await proposal.save();

      // Broadcast order event over WebSocket
      broadcastOrderStatus(req.user!.id, order);

      // Audit log
      await logAuditEvent({
        userId: req.user!.id,
        eventType: "proposal_approved",
        entityType: "order",
        entityId: order._id.toString(),
        payload: {
          proposalId: proposal._id.toString(),
          ticker: proposal.ticker,
          side: proposal.action,
          quantity,
          isPaper: order.isPaper,
        },
      });

      res.json({
        success: true,
        message: `Proposal approved. Order submitted to ${order.isPaper ? "Alpaca Paper" : "Alpaca Live"}.`,
        order,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Reject a proposal
proposalsRouter.post(
  "/proposals/:id/reject",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const proposal = await TradeProposal.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!.id, status: "pending" },
        { status: "rejected", reviewedAt: new Date() },
        { new: true }
      );

      if (!proposal) {
        res.status(404).json({ error: "Pending proposal not found." });
        return;
      }

      await logAuditEvent({
        userId: req.user!.id,
        eventType: "proposal_rejected",
        entityType: "trade_proposal",
        entityId: proposal._id.toString(),
        payload: { ticker: proposal.ticker },
      });

      res.json({ success: true, message: "Proposal rejected.", proposal });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Adjust proposal size within Risk Manager limits
proposalsRouter.patch(
  "/proposals/:id/adjust",
  requireAuth,
  validateBody(proposalAdjustSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { quantity } = req.body;
      const proposal = await TradeProposal.findOne({
        _id: req.params.id,
        userId: req.user!.id,
        status: "pending",
      });

      if (!proposal) {
        res.status(404).json({ error: "Pending proposal not found." });
        return;
      }

      // Verify that new quantity does not breach maxPositionPct
      const riskProfile = await RiskProfile.findOne({ userId: req.user!.id });
      const capital = riskProfile?.allocatableCapital || 10000;
      const maxPct = riskProfile?.maxPositionPct || 10;
      const estPrice = 150.0;
      const maxAllowedQty = Math.floor((capital * (maxPct / 100)) / estPrice);

      if (quantity > maxAllowedQty) {
        res.status(400).json({
          error: `Adjusted quantity (${quantity}) exceeds Risk Manager maximum allowed position limit (${maxAllowedQty} shares).`,
        });
        return;
      }

      proposal.suggestedQuantity = quantity;
      proposal.suggestedSizePct = Number(((quantity * estPrice) / capital * 100).toFixed(2));
      await proposal.save();

      await logAuditEvent({
        userId: req.user!.id,
        eventType: "proposal_adjusted",
        entityType: "trade_proposal",
        entityId: proposal._id.toString(),
        payload: { newQuantity: quantity, newSizePct: proposal.suggestedSizePct },
      });

      res.json(proposal);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);
