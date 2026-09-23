import { CheckCircle2, Clock, XCircle, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const orders = [
  { id: 'o1', ticker: 'RELIANCE.NS', side: 'buy', qty: 12, type: 'market', price: 2890.50, status: 'filled', isPaper: true, time: '10:42 AM', pnl: +820.40 },
  { id: 'o2', ticker: 'PLTR', side: 'buy', qty: 50, type: 'market', price: 70.77, status: 'filled', isPaper: true, time: '10:15 AM', pnl: +1234.00 },
  { id: 'o3', ticker: 'TCS.NS', side: 'sell', qty: 8, type: 'market', price: 3920.10, status: 'submitted', isPaper: true, time: '09:58 AM', pnl: null },
  { id: 'o4', ticker: 'AAPL', side: 'buy', qty: 15, type: 'market', price: 175.20, status: 'filled', isPaper: true, time: 'Yesterday', pnl: +42.00 },
  { id: 'o5', ticker: 'ETH/USD', side: 'buy', qty: 10, type: 'market', price: 2552.47, status: 'filled', isPaper: true, time: 'Yesterday', pnl: +10481.20 },
  { id: 'o6', ticker: 'SPY', side: 'sell', qty: 5, type: 'limit', price: 512.10, status: 'cancelled', isPaper: true, time: '2 days ago', pnl: null },
];

const statusIcon = (status: string) => {
  if (status === 'filled') return <CheckCircle2 className="h-4 w-4 text-profit" />;
  if (status === 'submitted') return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
  return <XCircle className="h-4 w-4 text-muted-foreground" />;
};

export function OrdersPage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Order History</h1>
          <p className="text-sm text-muted-foreground mt-1">Paper trading simulation — no real money at risk</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Paper Trading Mode
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: '6', sub: 'All time' },
          { label: 'Filled', value: '4', sub: 'Executed' },
          { label: 'Total P&L', value: '+$12,577', sub: 'Simulated' },
          { label: 'Win Rate', value: '80%', sub: '4 of 5 closed' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-indigo-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {['All', 'Filled', 'Submitted', 'Cancelled'].map((f) => (
          <button key={f} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${f === 'All' ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Ticker</th>
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Side</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Qty</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</th>
                <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">P&L</th>
                <th className="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground pr-6 hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-bold text-foreground">{o.ticker}</td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${o.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {o.side === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {o.side}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-300">{o.qty}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-mono text-slate-300">${o.price.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-muted-foreground capitalize hidden sm:table-cell">{o.type}</td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {statusIcon(o.status)}
                      <span className="text-xs font-medium capitalize text-slate-300 hidden sm:inline">{o.status}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-semibold hidden md:table-cell">
                    {o.pnl != null ? (
                      <span className={o.pnl >= 0 ? 'text-profit' : 'text-loss'}>{o.pnl >= 0 ? '+' : ''}${o.pnl.toFixed(2)}</span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 pr-6 text-sm text-right text-muted-foreground hidden lg:table-cell">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
