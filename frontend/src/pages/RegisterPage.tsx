import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type F = z.infer<typeof schema>;

const FIELDS = [
  { name:'name',            label:'Full Name', type:'text',     placeholder:'Ayush Sharma'  },
  { name:'email',           label:'Email',     type:'email',    placeholder:'you@example.com'},
  { name:'password',        label:'Password',  type:'password', placeholder:'••••••••'      },
  { name:'confirmPassword', label:'Confirm',   type:'password', placeholder:'••••••••'      },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ name, email, password }: F) => authApi.register({ name, email, password }),
    onSuccess: data => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Account created! 🎉'); navigate('/dashboard'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-[11px] flex items-center justify-center text-xl">🔥</div>
          <span className="text-[22px] font-bold text-white tracking-tight">HabitFlow</span>
        </div>

        <div className="card p-6 rounded-2xl">
          <h1 className="text-[18px] font-bold text-white mb-0.5">Create your account</h1>
          <p className="text-[13px] text-white/38 mb-6">Start building better habits today</p>

          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
            {FIELDS.map(f => (
              <div key={f.name}>
                <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">{f.label}</label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="input-base" />
                {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-2">
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[13px] text-white/38 mt-5">
            Already have one?{' '}
            <Link to="/login" className="text-brand-300 hover:text-brand-200 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
