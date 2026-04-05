import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Users, Zap, Lock, ChevronRight, Loader2 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    email: 'admin@dashboard.com',
    name: 'Alex Admin',
    role: 'Admin',
    description: 'Full access — create, edit, delete',
    color: '#6366f1',
    bg: 'from-indigo-500/20 to-indigo-600/10',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  {
    email: 'editor@dashboard.com',
    name: 'Emma Editor',
    role: 'Editor',
    description: 'Edit widgets, cannot delete dashboard',
    color: '#10b981',
    bg: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    email: 'viewer@dashboard.com',
    name: 'Victor Viewer',
    role: 'Viewer',
    description: 'View only — no edit permissions',
    color: '#f59e0b',
    bg: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300',
  },
];

export default function LoginPage() {
  const { loginWithEmail } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string) => {
    setLoading(email);
    setError(null);
    try {
      await loginWithEmail(email);
    } catch {
      setError('Connection failed. Make sure the server is running on port 3001.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">AnalytiQ</span>
          </div>
          <p className="text-slate-400 text-sm">Real-time collaborative analytics</p>
        </div>

        <div className="bg-surface-900/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6 shadow-glass-lg">
          <div className="mb-6">
            <h1 className="font-display text-xl font-bold text-white mb-1">Choose a demo account</h1>
            <p className="text-slate-400 text-sm">No password required — explore different roles</p>
          </div>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleLogin(account.email)}
                disabled={loading !== null}
                className={`w-full group relative bg-gradient-to-r ${account.bg} border ${account.border} rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: account.color + '33', border: `2px solid ${account.color}66` }}>
                    <span style={{ color: account.color }}>{account.name.split(' ').map((n: string) => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-semibold text-sm">{account.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${account.badge}`}>{account.role}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{account.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {loading === account.email ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" /> : <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[{ icon: Zap, label: 'Real-time', desc: 'Live sync' }, { icon: Users, label: 'Multi-user', desc: 'Collaborate' }, { icon: Lock, label: 'Role-based', desc: 'RBAC' }].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-surface-900/60 border border-white/6 rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-slate-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">Open multiple tabs to simulate real-time collaboration</p>
      </div>
    </div>
  );
}
