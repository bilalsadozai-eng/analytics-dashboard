import { memo, useState } from 'react';
import { BarChart3, Menu, Sun, Moon, Wifi, WifiOff, LogOut, ChevronDown, Download, Upload, FileJson, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatTime } from '@/lib/utils';
import type { ConnectedUser } from '@/types';

interface HeaderProps { onExportPDF: () => void; onExportJSON: () => void; onImportJSON: () => void; }

const ROLE_STYLES = {
  admin:  { badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'Admin' },
  editor: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Editor' },
  viewer: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Viewer' },
};

function UserAvatar({ user }: { user: ConnectedUser }) {
  return (
    <div title={`${user.user.name} (${user.user.role})`} className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ring-2 ring-surface-950" style={{ backgroundColor: user.user.color + '33', color: user.user.color }}>
      {user.user.avatar}
    </div>
  );
}

export const Header = memo(function Header({ onExportPDF, onExportJSON, onImportJSON }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar, isConnected, connectedUsers, dashboardTitle, lastUpdated, lastUpdatedBy } = useDashboardStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  if (!user) return null;
  const roleStyle = ROLE_STYLES[user.role];

  return (
    <header className="h-14 border-b border-white/6 bg-surface-900/90 backdrop-blur-xl flex items-center px-4 gap-3 relative z-30">
      <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"><Menu className="w-4 h-4" /></button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 text-white" /></div>
        <span className="font-display font-bold text-white text-sm hidden sm:block">AnalytiQ</span>
      </div>
      <div className="w-px h-5 bg-white/10 hidden sm:block" />
      <div className="hidden sm:block">
        <p className="text-white font-semibold text-sm leading-none">{dashboardTitle}</p>
        <p className="text-slate-500 text-xs mt-0.5">Updated {formatTime(lastUpdated)} by {lastUpdatedBy}</p>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">{isConnected ? `${connectedUsers.length} live` : 'Offline'}</span>
        </div>
        {connectedUsers.length > 0 && (
          <div className="flex -space-x-2">
            {connectedUsers.slice(0, 3).map((cu) => <UserAvatar key={cu.socketId} user={cu} />)}
            {connectedUsers.length > 3 && <div className="w-7 h-7 rounded-full bg-surface-800 border-2 border-surface-950 flex items-center justify-center text-xs text-slate-400">+{connectedUsers.length - 3}</div>}
          </div>
        )}
      </div>
      <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
      <div className="relative">
        <button onClick={() => { setExportOpen(!exportOpen); setUserOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-colors text-xs font-medium">
          <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
        </button>
        {exportOpen && (<>
          <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-surface-900 border border-white/10 rounded-xl shadow-glass-lg z-50 overflow-hidden">
            <button onClick={() => { onExportPDF(); setExportOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors"><FileText className="w-4 h-4 text-red-400" />Export as PDF</button>
            <button onClick={() => { onExportJSON(); setExportOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors"><FileJson className="w-4 h-4 text-amber-400" />Export as JSON</button>
            <div className="h-px bg-white/6 mx-3" />
            <button onClick={() => { onImportJSON(); setExportOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors"><Upload className="w-4 h-4 text-emerald-400" />Import JSON</button>
          </div>
        </>)}
      </div>
      <div className="relative">
        <button onClick={() => { setUserOpen(!userOpen); setExportOpen(false); }} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: user.color + '33', color: user.color }}>{user.avatar}</div>
          <span className="hidden sm:block text-sm text-white font-medium">{user.name.split(' ')[0]}</span>
          <span className={`hidden md:inline text-xs px-2 py-0.5 rounded-full border font-medium ${roleStyle.badge}`}>{roleStyle.label}</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
        {userOpen && (<>
          <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface-900 border border-white/10 rounded-xl shadow-glass-lg z-50 overflow-hidden">
            <div className="px-3 py-3 border-b border-white/6"><p className="text-white font-semibold text-sm">{user.name}</p><p className="text-slate-400 text-xs">{user.email}</p></div>
            <button onClick={() => { logout(); setUserOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-sm transition-colors"><LogOut className="w-4 h-4" />Sign out</button>
          </div>
        </>)}
      </div>
    </header>
  );
});
