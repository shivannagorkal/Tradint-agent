import { useState } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Activity, Play } from 'lucide-react';

const watchlistItems = [
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', price: 2890.50, change: 2.4, changeAmt: 67.80, vol: '12.4M', mktCap: '₹19.5T', signal: 'Bullish' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', price: 3920.10, change: -0.8, changeAmt: -31.60, vol: '4.2M', mktCap: '₹14.2T', signal: 'Neutral' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1680.75, change: 1.2, changeAmt: 19.95, vol: '8.9M', mktCap: '₹12.8T', signal: 'Bullish' },
  { ticker: 'INFY.NS', name: 'Infosys', price: 1840.30, change: -1.5, changeAmt: -28.05, vol: '6.1M', mktCap: '₹7.7T', signal: 'Bearish' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1240.60, change: 3.1, changeAmt: 37.20, vol: '15.2M', mktCap: '₹8.7T', signal: 'Bullish' },
  { ticker: 'PLTR', name: 'Palantir Technologies', price: 70.77, change: 4.2, changeAmt: 2.85, vol: '48.2M', mktCap: '$149B', signal: 'Bullish' },
];

export function WatchlistPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  const filtered = watchlistItems.filter(
    (i) => i.ticker.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">{watchlistItems.length} tickers tracked • Updated just now</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Ticker
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search ticker or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Ticker</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Change</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Volume</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Mkt Cap</th>
                <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">AI Signal</th>
                <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((item) => (
                <tr key={item.ticker} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.ticker}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{item.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-right text-foreground">{item.price.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                    <div className={`flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {item.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      <span className="font-semibold">{item.change >= 0 ? '+' : ''}{item.change}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-muted-foreground hidden md:table-cell">{item.vol}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-muted-foreground hidden lg:table-cell">{item.mktCap}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.signal === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' :
                      item.signal === 'Bearish' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' :
                      'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20'
                    }`}>
                      <Activity className="h-3 w-3" />
                      {item.signal}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors" title="Run Analysis">
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Add Ticker to Watchlist</h3>
            <input
              type="text"
              placeholder="e.g. AAPL, RELIANCE.NS, BTC-USD"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
