import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type F = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Welcome back!'); navigate('/dashboard'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Login failed'),
  });

  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-[11px] flex items-center justify-center text-xl">🔥</div>
          <span className="text-[22px] font-bold text-white tracking-tight">HabitFlow</span>
        </div>

        <div className="card p-6 rounded-2xl">
          <h1 className="text-[18px] font-bold text-white mb-0.5">Welcome back</h1>
          <p className="text-[13px] text-white/38 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-base" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-2">
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[13px] text-white/38 mt-5">
            No account?{' '}
            <Link to="/register" className="text-brand-300 hover:text-brand-200 font-semibold transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
