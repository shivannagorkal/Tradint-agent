import { Router, Request, Response } from "express";
import { addWatchlistItemSchema } from "@confluence/shared-schemas";
import { WatchlistItem, FactorScore, Forecast } from "../db/models";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const watchlistRouter = Router();

// Get user's watchlist with factor & forecast snapshot
watchlistRouter.get("/watchlist", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await WatchlistItem.find({ userId: req.user!.id }).sort({ createdAt: -1 });

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const factors = await FactorScore.findOne({ ticker: item.ticker }).sort({ asOfDate: -1 });
        const forecast = await Forecast.findOne({ ticker: item.ticker, horizon: "5d" }).sort({ asOfDate: -1 });

        return {
          id: item._id,
          ticker: item.ticker,
          assetClass: item.assetClass,
          createdAt: item.createdAt,
          factors: factors
            ? {
                compositeScore: factors.compositeScore,
                momentumScore: factors.momentumScore,
                technicalScore: factors.technicalScore,
              }
            : null,
          forecast: forecast
            ? {
                p10: forecast.p10,
                median: forecast.median,
                p90: forecast.p90,
              }
            : null,
        };
      })
    );

    res.json(enrichedItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add ticker to watchlist
watchlistRouter.post(
  "/watchlist",
  requireAuth,
  validateBody(addWatchlistItemSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticker, assetClass } = req.body;

      const item = await WatchlistItem.findOneAndUpdate(
        { userId: req.user!.id, ticker },
        { userId: req.user!.id, ticker, assetClass },
        { upsert: true, new: true }
      );

      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Remove ticker from watchlist
watchlistRouter.delete(
  "/watchlist/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await WatchlistItem.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
      res.json({ success: true, message: "Item removed from watchlist." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);
