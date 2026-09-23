import { useState } from 'react';
import { Play, Plus, CheckCircle2, Clock, XCircle, BarChart2, TrendingDown } from 'lucide-react';

const backtests = [
  {
    id: 'b1', name: 'Momentum + MACD Strategy', tickers: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'],
    start: '2023-01-01', end: '2024-01-01', sharpe: 1.84, deflatedSharpe: 1.42,
    pbo: 0.12, maxDrawdown: -9.4, eligible: true, status: 'completed', completedAt: '2h ago',
  },
  {
    id: 'b2', name: 'Mean Reversion Small-Cap', tickers: ['PLTR', 'AAPL', 'TSLA'],
    start: '2022-06-01', end: '2023-06-01', sharpe: 2.31, deflatedSharpe: 0.78,
    pbo: 0.58, maxDrawdown: -18.2, eligible: false, status: 'completed', completedAt: '1d ago',
  },
  {
    id: 'b3', name: 'Sector Rotation Quarterly', tickers: ['SPY', 'QQQ', 'IWM', 'VXX'],
    start: '2021-01-01', end: '2023-01-01', sharpe: null, deflatedSharpe: null,
    pbo: null, maxDrawdown: null, eligible: false, status: 'running', completedAt: '',
  },
];

export function BacktestsPage() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Strategy Backtests</h1>
          <p className="text-sm text-muted-foreground mt-1">Overfitting validation via purged walk-forward cross-validation</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" /> New Backtest
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
        <p><span className="font-bold">Eligibility Gate:</span> A strategy must pass overfitting validation (Deflated Sharpe &gt; 1.0 and PBO &lt; 0.25) before any AI proposal can be approved for paper trading.</p>
      </div>

      <div className="space-y-4">
        {backtests.map((bt) => (
          <div key={bt.id} className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{bt.name}</h3>
                    {bt.status === 'completed' && bt.eligible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Paper-Trade Eligible
                      </span>
                    )}
                    {bt.status === 'completed' && !bt.eligible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                        <XCircle className="h-3 w-3" /> Overfit — Not Eligible
                      </span>
                    )}
                    {bt.status === 'running' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20">
                        <Clock className="h-3 w-3 animate-spin" /> Running...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{bt.start} → {bt.end} • {bt.tickers.join(', ')}</p>
                </div>
                {bt.completedAt && <p className="text-xs text-muted-foreground">{bt.completedAt}</p>}
              </div>

              {bt.status === 'completed' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BarChart2 className="h-3 w-3" /> Sharpe Ratio</p>
                    <p className="text-xl font-bold text-foreground">{bt.sharpe?.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                    <p className="text-xs text-muted-foreground mb-1">Deflated Sharpe</p>
                    <p className={`text-xl font-bold ${(bt.deflatedSharpe ?? 0) > 1 ? 'text-profit' : 'text-loss'}`}>{bt.deflatedSharpe?.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                    <p className="text-xs text-muted-foreground mb-1">P(Backtest Overfit)</p>
                    <p className={`text-xl font-bold ${(bt.pbo ?? 1) < 0.25 ? 'text-profit' : 'text-loss'}`}>{((bt.pbo ?? 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Max Drawdown</p>
                    <p className="text-xl font-bold text-loss">{bt.maxDrawdown?.toFixed(1)}%</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin text-yellow-400" />
                    Running walk-forward cross-validation... computing deflated Sharpe ratio...
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Backtest Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-5">Configure New Backtest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Strategy Name</label>
                <input type="text" placeholder="e.g. RSI + Volume Strategy" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ticker Universe (comma separated)</label>
                <input type="text" placeholder="RELIANCE.NS, TCS.NS, PLTR" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                  <input type="date" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
                  <input type="date" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">Cancel</button>
              <button onClick={() => setShowNew(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">
                <Play className="h-4 w-4" /> Run Validation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
