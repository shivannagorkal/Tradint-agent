import { ShieldAlert, Activity, AlertTriangle } from 'lucide-react';

export const RiskPanel = () => {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" /> Risk Analysis
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full ring-1 ring-amber-100">Medium Risk</span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Volatility (30D)', value: '18.4%', icon: Activity, color: 'text-amber-500' },
            { label: 'Max Drawdown', value: '-12.5%', icon: null, color: 'text-loss' },
            { label: 'Risk/Reward', value: '1:2.4', icon: null, color: 'text-profit' },
            { label: 'Suggested Size', value: '5.0%', icon: null, color: 'text-indigo-600' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-orange-400" /> Stress Scenarios
          </h4>
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-xs font-bold text-emerald-700 mb-0.5">BULL CASE (+15%)</p>
              <p className="text-xs text-slate-600">Target ₹3,200. Re-evaluate if volume drops during uptrend.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-border rounded-lg">
              <p className="text-xs font-bold text-slate-600 mb-0.5">BASE CASE (+5%)</p>
              <p className="text-xs text-slate-500">Target ₹2,950. Consolidation likely before next leg up.</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-bold text-red-600 mb-0.5">BEAR CASE (-8%)</p>
              <p className="text-xs text-slate-600">Stop-loss at ₹2,600. Max acceptable loss: ₹4,000.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
