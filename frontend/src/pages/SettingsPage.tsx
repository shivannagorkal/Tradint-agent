import { useState } from 'react';
import { Key, ShieldAlert, Bell, Eye, EyeOff, Check } from 'lucide-react';

function MaskedInput({ label, placeholder, saved }: { label: string; placeholder: string; saved?: boolean }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState(saved ? '••••••••••••••••••XXXX' : '');
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-lg pl-4 pr-10 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {saved && <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Saved — only last 4 chars visible</p>}
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'risk' | 'notifications'>('risk');
  const [killSwitch, setKillSwitch] = useState(false);

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your risk profile, API credentials, and notifications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { id: 'risk', label: 'Risk Profile', icon: ShieldAlert },
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Risk Profile Tab */}
      {activeTab === 'risk' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-6">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-yellow-400" /> Risk Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Risk Category</label>
              <select className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>Balanced</option>
                <option>Conservative</option>
                <option>Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Allocatable Capital ($)</label>
              <input type="number" defaultValue={12450} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Position Size (%)</label>
              <input type="number" defaultValue={10} min={1} max={25} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Daily Loss (%)</label>
              <input type="number" defaultValue={3} min={1} max={10} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          {/* Kill Switch */}
          <div className={`rounded-xl p-5 border ${killSwitch ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-border'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2"><ShieldAlert className={`h-5 w-5 ${killSwitch ? 'text-red-400' : 'text-slate-400'}`} /> Global Kill Switch</h3>
                <p className="text-sm text-muted-foreground mt-1">Immediately halts all new order submissions and AI recommendations.</p>
              </div>
              <button
                onClick={() => setKillSwitch(!killSwitch)}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${killSwitch ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-border'}`}
              >
                {killSwitch ? 'ENGAGED — Click to Disengage' : 'Engage Kill Switch'}
              </button>
            </div>
          </div>

          <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors">Save Risk Profile</button>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-foreground">API Credentials</h2>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-300">
            Keys are encrypted with AES-256-GCM at rest. They are never transmitted to the browser after saving — only the last 4 characters are shown.
          </div>
          <div className="space-y-5">
            <div className="border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Alpaca (Paper)</h3>
              <MaskedInput label="API Key" placeholder="PK..." saved />
              <MaskedInput label="API Secret" placeholder="Secret..." saved />
            </div>
            <div className="border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">LLM Providers</h3>
              <MaskedInput label="Groq API Key" placeholder="gsk_..." />
              <MaskedInput label="Gemini API Key" placeholder="AIza..." />
              <MaskedInput label="Mistral API Key" placeholder="..." />
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors">Save Credentials</button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-6">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><Bell className="h-5 w-5 text-indigo-400" /> Notifications</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notification Email</label>
            <input type="email" placeholder="alerts@yourdomain.com" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'New trade proposal awaiting approval', enabled: true },
              { label: 'Risk Manager veto alert', enabled: true },
              { label: 'Kill switch engaged/disengaged', enabled: true },
              { label: 'Order filled confirmation', enabled: false },
              { label: 'Daily P&L summary', enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <p className="text-sm text-slate-300">{n.label}</p>
                <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${n.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow transition-transform ${n.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors">Save Preferences</button>
        </div>
      )}
    </div>
  );
}
