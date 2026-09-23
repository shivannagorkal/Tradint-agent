import { api } from "./api";

export interface StockQuote {
  ticker: string;
  companyName: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  rsi: number;
  macd: number;
  sma50: number;
  volatility: string;
  chartData: { time: string; value: number }[];
  marketDepth?: {
    bids?: { price: number; quantity: number }[];
    asks?: { price: number; quantity: number }[];
  };
  source?: string;
}

export interface MarketIndex {
  name: string;
  ticker: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  changePct: number;
}

export const marketService = {
  getQuote: async (ticker: string, timeframe: string = "1M"): Promise<StockQuote> => {
    return api.get<StockQuote>(`/market/quote/${encodeURIComponent(ticker)}?timeframe=${timeframe}`);
  },
  getIndices: async (): Promise<{ indices: MarketIndex[]; asOf: string }> => {
    return api.get<{ indices: MarketIndex[]; asOf: string }>("/market/indices");
  },
};
