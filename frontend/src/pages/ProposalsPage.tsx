import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

const proposals = [
  {
    id: 'p1', ticker: 'RELIANCE.NS', action: 'buy', confidence: 0.72, status: 'pending',
    suggestedQty: 12, suggestedSizePct: 5.0, price: 2890.50,
    rationale: 'Strong technical momentum with MACD crossover, increasing volume, and positive Q3 earnings. Bull Researcher presented compelling evidence of a breakout pattern.',
    createdAt: '2 min ago', horizon: '5d',
    bullArgs: ['MACD crossover confirmed', 'Volume surge +34%', 'Positive earnings beat'],
    bearArgs: ['Resistance at ₹3000', 'Sector underperformance'],
  },
  {
    id: 'p2', ticker: 'PLTR', action: 'buy', confidence: 0.85, status: 'pending',
    suggestedQty: 50, suggestedSizePct: 7.5, price: 70.77,
    rationale: 'AI government contract momentum. Technical indicators show strong trend continuation. Risk Manager confirmed within position limits.',
    createdAt: '15 min ago', horizon: '20d',
    bullArgs: ['New government contract', 'RSI momentum strong', 'Analyst upgrades'],
    bearArgs: ['High valuation multiples', 'Market volatility risk'],
  },
  {
    id: 'p3', ticker: 'TCS.NS', action: 'sell', confidence: 0.61, status: 'pending',
    suggestedQty: 8, suggestedSizePct: 3.0, price: 3920.10,
    rationale: 'Deteriorating technical outlook with bearish divergence. Bear Researcher cited weakening deal pipeline and management guidance cut risk.',
    createdAt: '1 hr ago', horizon: '5d',
    bullArgs: ['Strong brand moat', 'Dividend yield support'],
    bearArgs: ['MACD bearish divergence', 'Guidance cut risk', 'IT sector slowdown'],
  },
];

export function ProposalsPage() {
  const [expanded, setExpanded] = useState<string | null>('p1');

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Trade Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-generated recommendations awaiting your approval</p>
      </div>

      {/* Status pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pending Review', count: 3, color: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20' },
          { label: 'Approved Today', count: 2, color: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
          { label: 'Rejected', count: 1, color: 'bg-red-500/10 text-red-400 ring-red-500/20' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ${s.color}`}>
            <span>{s.label}</span>
            <span className="font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Header row */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors gap-4"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${p.action === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {p.action === 'buy' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-foreground">{p.ticker}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${p.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{p.action}</span>
                    <span className="text-xs text-muted-foreground">{p.horizon} horizon</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.suggestedQty} shares @ {p.price.toLocaleString()} • Size: {p.suggestedSizePct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.confidence * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-indigo-400">{(p.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <span className="text-xs text-muted-foreground hidden sm:block">{p.createdAt}</span>
                {expanded === p.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {/* Expanded Detail */}
            {expanded === p.id && (
              <div className="border-t border-border p-5 space-y-5 bg-slate-900/30">
                <div className="flex items-start gap-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
                  <BrainCircuit className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{p.rationale}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Bull Arguments</h4>
                    <ul className="space-y-1">
                      {p.bullArgs.map((a, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-emerald-500">✓</span>{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Bear Arguments</h4>
                    <ul className="space-y-1">
                      {p.bearArgs.map((a, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-red-500">⚠</span>{a}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
