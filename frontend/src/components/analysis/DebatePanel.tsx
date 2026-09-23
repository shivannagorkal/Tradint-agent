import { Swords, TrendingUp, TrendingDown } from 'lucide-react';

export const DebatePanel = () => {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Swords className="h-4 w-4 text-indigo-500" /> Bull vs Bear Debate
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Synthesis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border flex-1">
        <div className="p-5 bg-emerald-50/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Bull Researcher</h4>
          </div>
          <ul className="space-y-2">
            {['Strong MACD crossover momentum.', 'Volume surge of +34% confirms move.', 'Positive Q3 earnings beat.', 'Key support holding at ₹2,850.'].map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>{a}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-red-50/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">Bear Researcher</h4>
          </div>
          <ul className="space-y-2">
            {['Strong resistance at prior ATH.', 'Overall market volatility elevated.', 'Negative macro catalyst risk.', 'Sector trend showing weakness.'].map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-red-400 font-bold mt-0.5">•</span>{a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 bg-indigo-50 border-t border-indigo-100">
        <p className="text-xs text-center text-indigo-700 font-medium">
          <span className="font-bold">Portfolio Manager:</span> Evidence is mixed — bullish momentum is strong but overhead resistance is significant. Hold / Wait for confirmation.
        </p>
      </div>
    </div>
  );
};
