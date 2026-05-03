import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button onClick={()=>onChange(!checked)}
      className={cn('relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-brand-600' : 'bg-white/[0.12]')}>
      <span className={cn('absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
        checked ? 'right-[3px]' : 'left-[3px]')} />
    </button>
  );
}

function Section({ icon: Icon, title, children }: { icon:any; title:string; children:React.ReactNode }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-white/[0.06]">
        <Icon className="w-4 h-4 text-brand-400" />
        <h2 className="text-[13px] font-semibold text-white/80">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: me } = useQuery({ queryKey:['me'], queryFn: authApi.getMe });

  const [name, setName] = useState(user?.name ?? '');
  const [notifs, setNotifs] = useState({ daily:true, streak:true, weekly:false });

  const handleLogout = async () => {
    try { await authApi.logout(); } finally { logout(); navigate('/login'); toast.success('Signed out'); }
  };

  const section = [
    { key:'daily',   label:'Daily reminder',   desc:'Remind you to check in each day' },
    { key:'streak',  label:'Streak alerts',     desc:'Alert when your streak is at risk' },
    { key:'weekly',  label:'Weekly summary',    desc:'Email recap every Sunday' },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-[16px] font-bold text-white shrink-0">
              {(me?.name ?? user?.name ?? 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">{me?.name ?? user?.name}</p>
              <p className="text-[12px] text-white/38">
                Member since {me?.createdAt ? format(parseISO(me.createdAt),'MMMM yyyy') : '—'}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Email</label>
            <input defaultValue={me?.email ?? user?.email} disabled
              className="input-base opacity-40 cursor-not-allowed" />
          </div>
          <button
            onClick={() => toast.success('Profile updated!')}
            className="btn-primary">
            Save Changes
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div className="space-y-4">
          {section.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] text-white/75 font-medium">{label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={notifs[key]}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Account security */}
      <Section icon={Shield} title="Account">
        <div className="space-y-3">
          <p className="text-[13px] text-white/50">
            Your data is encrypted and securely stored. Passwords are hashed with bcrypt.
          </p>
          <button
            onClick={() => toast('Password reset — coming soon!', { icon: '🔒' })}
            className="btn-ghost text-[13px]">
            Change Password
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section icon={LogOut} title="Danger Zone">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.10] text-white/55 hover:text-white/80 hover:bg-white/[0.05] text-[13px] font-medium transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <button onClick={() => { if (confirm('Delete your account? This cannot be undone.')) toast.error('Account deletion — coming soon!'); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[13px] font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
