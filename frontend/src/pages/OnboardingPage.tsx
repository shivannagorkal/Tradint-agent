import { useNavigate } from 'react-router-dom';
import { Layers, ShieldAlert } from 'lucide-react';

export function OnboardingPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full bg-white border border-border rounded-2xl shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Complete your profile</h1>
            <p className="text-indigo-200 text-sm">Set your risk tolerance and link your broker to activate Confluence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Risk Category</label>
              <select className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                <option value="balanced">Balanced (Default)</option>
                <option value="conservative">Conservative</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Allocatable Capital ($)</label>
              <input type="number" min="0" placeholder="10000" className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Position Size (%)</label>
              <input type="number" min="1" max="25" placeholder="10" className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Daily Loss (%)</label>
              <input type="number" min="1" max="10" placeholder="3" className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Alpaca Paper API Key <span className="text-red-500">*</span></label>
              <input type="password" required placeholder="PK..." className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Alpaca Paper Secret <span className="text-red-500">*</span></label>
              <input type="password" required placeholder="Secret..." className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-mono" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Keys are encrypted with AES-256-GCM and stored server-side only. They are never accessible from the browser after saving.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-8 rounded-lg text-sm transition-colors shadow-md shadow-indigo-500/20">
              Complete Setup →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
