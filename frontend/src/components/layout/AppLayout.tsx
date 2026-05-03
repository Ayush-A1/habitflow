import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, ListChecks, Target, BarChart2, StickyNote, Settings, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/dashboard', icon:LayoutDashboard, label:'Dashboard' },
  { to:'/habits',    icon:ListChecks,      label:'Habits'    },
  { to:'/goals',     icon:Target,          label:'Goals'     },
  { to:'/analytics', icon:BarChart2,       label:'Analytics' },
  { to:'/notes',     icon:StickyNote,      label:'Notes'     },
  { to:'/settings',  icon:Settings,        label:'Settings'  },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      logout(); navigate('/login'); toast.success('Signed out');
    }
  };

  return (
    <div className="flex h-screen bg-[#08080F] text-white overflow-hidden">
      {open && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-30 w-[210px] flex flex-col',
        'bg-[#060609] border-r border-white/[0.06]',
        'transition-transform duration-200 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.06]">
          <div className="w-8 h-8 bg-brand-600 rounded-[10px] flex items-center justify-center text-[15px] shrink-0">🔥</div>
          <span className="text-[15px] font-bold text-white tracking-tight">HabitFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}>
              <Icon className="w-[15px] h-[15px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User strip */}
        <div className="px-2.5 py-4 border-t border-white/[0.06] space-y-1">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/85 truncate">{user?.name}</p>
              <p className="text-[11px] text-white/32 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full nav-item text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-[15px] h-[15px] shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#060609] shrink-0">
          <button onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-[7px] flex items-center justify-center text-xs">🔥</div>
            <span className="font-bold text-white text-sm tracking-tight">HabitFlow</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
