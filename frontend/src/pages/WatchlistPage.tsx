import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Activity, Play, Loader2 } from 'lucide-react';
import { watchlistService, type WatchlistEnrichedItem } from '@/services/watchlistService';

export function WatchlistPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [assetClass, setAssetClass] = useState<'equity' | 'crypto'>('equity');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data: watchlistItems = [], isLoading } = useQuery<WatchlistEnrichedItem[]>({
    queryKey: ['watchlist'],
    queryFn: watchlistService.getWatchlist,
  });

  const addMutation = useMutation({
    mutationFn: ({ ticker, assetClass }: { ticker: string; assetClass: 'equity' | 'crypto' }) =>
      watchlistService.addTicker(ticker, assetClass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setShowAddModal(false);
      setNewTicker('');
      setActionMessage('Ticker successfully added to watchlist.');
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err: any) => {
      alert(`Error adding ticker: ${err?.message || 'Failed'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistService.removeTicker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: (ticker: string) => watchlistService.runAnalysis(ticker, '5d'),
    onSuccess: (_data, ticker) => {
      setActionMessage(`Multi-agent analysis triggered for ${ticker}! Live debate committee running.`);
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      alert(`Analysis error: ${err?.message || 'Failed to trigger run'}`);
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    addMutation.mutate({ ticker: newTicker.trim().toUpperCase(), assetClass });
  };

  const filtered = watchlistItems.filter((i) =>
    i.ticker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {watchlistItems.length} tickers tracked • Enriched with real Qlib factor scores & forecasts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Ticker
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
          {actionMessage}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tracked tickers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-white border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading enriched watchlist from MongoDB...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-foreground">No tickers in your watchlist yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first stock or crypto asset to start tracking AI signals.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Add Ticker Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Ticker</th>
                  <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Asset Class</th>
                  <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Factor Composite</th>
                  <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Momentum</th>
                  <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">5D Forecast Median</th>
                  <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">AI Signal</th>
                  <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filtered.map((item) => {
                  const score = item.factors?.compositeScore;
                  const signal = score != null ? (score > 0.25 ? 'Bullish' : score < -0.25 ? 'Bearish' : 'Neutral') : 'Pending';
                  const mom = item.factors?.momentumScore ?? 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">{item.ticker}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.assetClass}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-right text-foreground">
                        {item.factors ? item.factors.compositeScore.toFixed(3) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right hidden md:table-cell">
                        <div className={`flex items-center justify-end gap-1 ${mom >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {mom >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          <span className="font-semibold">{item.factors ? mom.toFixed(3) : '—'}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-600 hidden lg:table-cell font-mono">
                        {item.forecast ? `$${item.forecast.median.toFixed(2)}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          signal === 'Bullish' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' :
                          signal === 'Bearish' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' :
                          'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20'
                        }`}>
                          <Activity className="h-3 w-3" />
                          {signal}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => runAnalysisMutation.mutate(item.ticker)}
                            disabled={runAnalysisMutation.isPending}
                            className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Run Multi-Agent Committee Analysis"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${item.ticker} from watchlist?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Add Ticker to Watchlist</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Symbol / Ticker</label>
                <input
                  type="text"
                  placeholder="e.g. AAPL, RELIANCE.NS, BTC-USD"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Asset Class</label>
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value as any)}
                  className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="equity">Equity (Stock)</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {addMutation.isPending ? 'Adding...' : 'Add Ticker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
