import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldAlert, AlertCircle } from 'lucide-react';
import { onboardingService } from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';

export function OnboardingPage() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [riskCategory, setRiskCategory] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [allocatableCapital, setAllocatableCapital] = useState('10000');
  const [maxPositionPct, setMaxPositionPct] = useState('10');
  const [maxDailyLossPct, setMaxDailyLossPct] = useState('3');
  const [alpacaPaperKey, setAlpacaPaperKey] = useState('');
  const [alpacaPaperSecret, setAlpacaPaperSecret] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const capitalNum = parseFloat(allocatableCapital);
    const maxPosNum = parseFloat(maxPositionPct);
    const maxLossNum = parseFloat(maxDailyLossPct);

    if (isNaN(capitalNum) || capitalNum <= 0) {
      setError('Please enter a valid allocatable capital amount.');
      return;
    }
    if (isNaN(maxPosNum) || maxPosNum < 1 || maxPosNum > 25) {
      setError('Max position size must be between 1% and 25%.');
      return;
    }
    if (isNaN(maxLossNum) || maxLossNum < 1 || maxLossNum > 10) {
      setError('Max daily loss limit must be between 1% and 10%.');
      return;
    }

    setLoading(true);
    try {
      await onboardingService.completeOnboarding({
        riskCategory,
        allocatableCapital: capitalNum,
        maxPositionPct: maxPosNum,
        maxDailyLossPct: maxLossNum,
        alpacaPaperKey: alpacaPaperKey.trim(),
        alpacaPaperSecret: alpacaPaperSecret.trim(),
      });

      // Refresh auth state to ensure risk profile is stored in Zustand
      await checkAuth();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete profile onboarding. Please check your inputs.');
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Risk Category</label>
              <select
                value={riskCategory}
                onChange={(e) => setRiskCategory(e.target.value as any)}
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="balanced">Balanced (Default)</option>
                <option value="conservative">Conservative</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Allocatable Capital ($)</label>
              <input
                type="number"
                min="100"
                value={allocatableCapital}
                onChange={(e) => setAllocatableCapital(e.target.value)}
                placeholder="10000"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Position Size (%)</label>
              <input
                type="number"
                min="1"
                max="25"
                value={maxPositionPct}
                onChange={(e) => setMaxPositionPct(e.target.value)}
                placeholder="10"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Daily Loss (%)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxDailyLossPct}
                onChange={(e) => setMaxDailyLossPct(e.target.value)}
                placeholder="3"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alpaca Paper API Key <span className="text-muted-foreground text-xs font-normal">(Optional for mock testing)</span>
              </label>
              <input
                type="password"
                value={alpacaPaperKey}
                onChange={(e) => setAlpacaPaperKey(e.target.value)}
                placeholder="PK..."
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alpaca Paper Secret <span className="text-muted-foreground text-xs font-normal">(Optional for mock testing)</span>
              </label>
              <input
                type="password"
                value={alpacaPaperSecret}
                onChange={(e) => setAlpacaPaperSecret(e.target.value)}
                placeholder="Secret..."
                className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-mono"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Keys are encrypted with AES-256-GCM and stored server-side only. They are never accessible from the browser after saving.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 px-8 rounded-lg text-sm transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              {loading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Configuring Profile...' : 'Complete Setup →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
