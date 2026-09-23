import { ShieldAlert, Bell, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-white px-4 md:px-6 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 border border-border px-3 py-1.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Market Open
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Kill Switch */}
        <button
          onClick={() => setKillSwitchEngaged(!killSwitchEngaged)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all border ${
            killSwitchEngaged
              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-border'
          }`}
        >
          <ShieldAlert className={`h-4 w-4 ${killSwitchEngaged ? 'text-red-500' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{killSwitchEngaged ? 'HALTED' : 'Kill Switch'}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 uppercase">
              {user?.name?.[0] || 'T'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground capitalize">{user?.name || 'Trader'}</p>
              <p className="text-xs text-muted-foreground">Paper Mode</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
