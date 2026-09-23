import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [riskCategory, setRiskCategory] = useState('balanced');
  const [paperBalance, setPaperBalance] = useState('100000');
  const [maxPosition, setMaxPosition] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full bg-white border border-border rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-7 flex items-center gap-4">
          <img src="/logo.jpeg" alt="TradeX Logo" className="h-10 w-auto object-contain rounded-xl" />
          <div>
            <h1 className="text-xl font-bold text-white">Welcome to TradeX</h1>
            <p className="text-indigo-100 text-sm mt-0.5">Customize your simulation environment — no broker keys required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Paper Sandbox Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>Free Paper Trading Sandbox Activated</span>
                <span className="bg-emerald-200/70 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">100% Risk Free</span>
              </p>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                TradeX provides a complete virtual paper trading environment with simulated live data feeds. You can explore multi-agent AI debates, test quant strategies, and backtest without needing to enter any broker keys.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Risk Profile</label>
              <select
                value={riskCategory}
                onChange={(e) => setRiskCategory(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="balanced">Balanced (Recommended)</option>
                <option value="conservative">Conservative (Capital Preservation)</option>
                <option value="aggressive">Aggressive (High Conviction)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Simulated Starting Capital ($)</label>
              <input
                type="number"
                value={paperBalance}
                onChange={(e) => setPaperBalance(e.target.value)}
                min="1000"
                step="1000"
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Max Position Size (%)</label>
              <input
                type="number"
                value={maxPosition}
                onChange={(e) => setMaxPosition(e.target.value)}
                min="1"
                max="25"
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">AI Committee Consensus Level</label>
              <select className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                <option value="70">70% Consensus Required</option>
                <option value="80">80% High Conviction</option>
                <option value="60">60% Moderate Conviction</option>
              </select>
            </div>
          </div>

          {/* Optional Broker Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Have an external Alpaca broker account? You can optionally connect it anytime in <strong>Settings → API Keys</strong>.</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 py-2.5 px-4"
            >
              Skip & Use Defaults
            </button>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-7 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center gap-2"
            >
              <span>Enter TradeX Terminal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
