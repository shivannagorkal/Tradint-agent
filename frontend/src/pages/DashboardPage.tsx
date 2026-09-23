import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Activity, DollarSign, PieChart, RefreshCw, Search, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { StockChart } from '@/components/charts/StockChart';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { AgentActivityPanel } from '@/components/agents/AgentActivityPanel';
import { AgentWorkflow } from '@/components/agents/AgentWorkflow';
import { AIAnalysis } from '@/components/analysis/AIAnalysis';
import { DebatePanel } from '@/components/analysis/DebatePanel';
import { NewsPanel } from '@/components/news/NewsPanel';
import { RiskPanel } from '@/components/risk/RiskPanel';
import { MOCK_PORTFOLIO, MOCK_POSITIONS, CHART_DATA_BY_TIMEFRAME } from '@/services/mockData';
import { onboardingService } from '@/services/onboardingService';
import { orderService } from '@/services/orderService';
import { watchlistService } from '@/services/watchlistService';
import { marketService, type StockQuote } from '@/services/marketService';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1M');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const { data: riskProfile } = useQuery({
    queryKey: ['risk-profile'],
    queryFn: onboardingService.getRiskProfile,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
  });

  const { data: quote, isLoading: isQuoteLoading } = useQuery<StockQuote>({
    queryKey: ['market-quote', activeTicker, activeTimeframe],
    queryFn: () => marketService.getQuote(activeTicker, activeTimeframe),
  });

  const { data: indicesData } = useQuery({
    queryKey: ['market-indices'],
    queryFn: marketService.getIndices,
    refetchInterval: 20000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSelectTicker = async (ticker: string) => {
    setActiveTicker(ticker);
    setSearchQuery(ticker);
    setSearchStatus(`Fetching real-time market data for ${ticker}...`);
    try {
      await watchlistService.runAnalysis(ticker);
      setSearchStatus(`Loaded live quote for ${ticker}. Multi-agent debate proposal generated.`);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    } catch {
      setSearchStatus(`Loaded live quote for ${ticker}.`);
    }
    setTimeout(() => setSearchStatus(null), 5000);
  };

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const ticker = searchQuery.trim().toUpperCase();
      await handleSelectTicker(ticker);
    }
  };

  const totalValue = riskProfile?.allocatableCapital || MOCK_PORTFOLIO.totalValue;
  const riskLevel = riskProfile?.riskCategory ? riskProfile.riskCategory.toUpperCase() : MOCK_PORTFOLIO.riskLevel;
  const activeCount = orders.filter((o) => o.status?.toLowerCase() === 'filled').length || MOCK_PORTFOLIO.activePositions;

  const currentPrice = quote?.price ?? 228.87;
  const changeVal = quote?.change ?? 5.4;
  const changePctVal = quote?.changePct ?? 2.4;
  const isPositive = changeVal >= 0;
  const currencySymbol = quote?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Benchmark Indices Marquee Strip */}
      {indicesData?.indices && indicesData.indices.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-2.5 bg-white border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE INDICES (Groww API):
          </div>
          {indicesData.indices.map((idx) => {
            const isIdxPos = idx.change >= 0;
            return (
              <button
                key={idx.ticker}
                onClick={() => handleSelectTicker(idx.ticker)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  activeTicker === idx.ticker
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{idx.name}</span>
                <span className="font-semibold">₹{idx.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
                <span className={isIdxPos ? 'text-emerald-600' : 'text-red-500'}>
                  {isIdxPos ? '+' : ''}{idx.changePct}%
                </span>
              </button>
            );
          })}

          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Quick Track:</span>
            {['RELIANCE', 'TCS', 'NVDA', 'AAPL', 'TSLA'].map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTicker(t)}
                className={`text-xs px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                  activeTicker === t
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Market Open • Real-time Multi-Agent Quantitative Analysis • Powered by Groww & Global LPUs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbol (e.g. RELIANCE, NIFTY, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full md:w-80 bg-white border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-mono"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {searchStatus && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm">
          <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
          {searchStatus}
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Portfolio Capital"
          value={`$${totalValue.toLocaleString()}`}
          icon={DollarSign}
          trend={`+${MOCK_PORTFOLIO.totalReturnPct}% Simulated`}
          trendUp={true}
        />
        <MetricCard
          label="Today's P&L"
          value={`+$${MOCK_PORTFOLIO.dayPnL.toFixed(2)}`}
          icon={TrendingUp}
          trend={`+${MOCK_PORTFOLIO.dayPnLPct}%`}
          trendUp={true}
        />
        <MetricCard
          label="Available Capital"
          value={`$${(totalValue * 0.4).toLocaleString()}`}
          icon={PieChart}
          trend={`${activeCount} Active Positions`}
        />
        <MetricCard
          label="Risk Profile Mode"
          value={riskLevel}
          icon={Activity}
          trend="Within Gate Limits"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart Card */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {quote?.companyName || activeTicker}
                  </h3>
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    {quote?.ticker || activeTicker}
                  </span>
                  {isQuoteLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
                </div>
                <p className={`text-sm font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {currencySymbol}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {quote?.currency || 'USD'} • {isPositive ? '+' : ''}{currencySymbol}{changeVal.toFixed(2)} ({isPositive ? '+' : ''}{changePctVal.toFixed(2)}%) Today
                </p>
              </div>

              {/* Working Timeframe Buttons */}
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      activeTimeframe === tf
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <StockChart
              data={quote?.chartData?.length ? quote.chartData : CHART_DATA_BY_TIMEFRAME[activeTimeframe]}
              lineColor="#6366f1"
              areaTopColor="rgba(99,102,241,0.15)"
              areaBottomColor="rgba(99,102,241,0.0)"
            />

            {/* Technical Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">RSI (14)</p>
                <p className="text-2xl font-bold text-emerald-600">{quote?.rsi?.toFixed(1) ?? '62.4'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  {(quote?.rsi ?? 60) > 70 ? 'Overbought' : (quote?.rsi ?? 60) < 30 ? 'Oversold' : 'Neutral-Bull'}
                </p>
              </div>
              <div className="text-center border-l border-border">
                <p className="text-xs text-muted-foreground mb-1">MACD</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {((quote?.macd ?? 10) >= 0 ? '+' : '') + (quote?.macd?.toFixed(2) ?? '10.64')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Positive</p>
              </div>
              <div className="text-center border-l border-border">
                <p className="text-xs text-muted-foreground mb-1">SMA (50)</p>
                <p className="text-2xl font-bold text-foreground">{currencySymbol}{quote?.sma50?.toFixed(2) ?? '224.80'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Trend Support</p>
              </div>
              <div className="text-center border-l border-border">
                <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                <p className="text-2xl font-bold text-amber-500">{quote?.volatility ?? '17.2%'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Annualized</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AgentWorkflow />
            <DebatePanel />
          </div>

          <AIAnalysis />
        </div>

        {/* Right Column */}
        <div className="space-y-6 flex flex-col">
          <div className="h-80 shrink-0"><AgentActivityPanel /></div>
          <div className="h-96 shrink-0"><RiskPanel /></div>
          <div className="h-96 shrink-0"><NewsPanel /></div>
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Asset Allocation</h3>
            <PortfolioChart />
          </div>
        </div>
      </div>

      {/* Open Positions Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Active Broker Positions</h3>
          <span className="text-xs text-muted-foreground">Synchronized with Alpaca Paper</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Ticker</th>
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Entry</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Current</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground pr-6">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {MOCK_POSITIONS.map((pos) => (
                <tr key={pos.ticker} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-bold text-foreground">{pos.ticker}</td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {pos.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-muted-foreground">{pos.size}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-muted-foreground">${pos.entry.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-muted-foreground">${pos.current.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold text-sm ${pos.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {pos.pnl >= 0 ? '+' : '-'}${Math.abs(pos.pnl).toLocaleString()}
                      </span>
                      <span className={`text-xs ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {pos.pnlPct.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
