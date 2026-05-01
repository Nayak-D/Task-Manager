import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bell, Eye, EyeOff, Lock, Mail, LogIn, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { user, setAuth, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>('student');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  // If already authenticated, show a button to logout and switch mode
  if (isAuthenticated && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm md:max-w-md lg:max-w-lg pointer-events-auto"
      >
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-center hover:bg-white/[0.05] transition-all duration-300 overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold text-white mb-2">Already Logged In</h2>
          <p className="text-white/60 text-sm mb-6">
            You are currently logged in as <span className="font-semibold text-accent-teal">{user.name}</span> ({user.role})
          </p>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                clearAuth();
                reset();
              }}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm transition-all shadow-glow"
            >
              Logout & Switch Account
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/10"
            >
              Continue as {user.role === 'admin' ? 'Admin' : 'Student'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleModeChange = (mode: 'student' | 'admin') => {
    setLoginMode(mode);
    reset({ email: '', password: '' });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.login({ ...data, mode: loginMode });
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        // interceptor already showed the toast
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-sm md:max-w-md lg:max-w-lg pointer-events-auto"
    >
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl hover:bg-white/[0.05] transition-all duration-300 overflow-y-auto max-h-[90vh]">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-14 sm:w-16 h-14 sm:h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"
          >
            <Bell size={24} className="text-white sm:w-7 sm:h-7" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/50 text-xs sm:text-sm">Sign in to Digital Task Manager</p>
        </div>

        {/* Login Mode Toggle */}
        <div className="flex gap-2 mb-6 sm:mb-8 bg-white/5 p-1 rounded-lg border border-white/10">
          <motion.button
            type="button"
            onClick={() => handleModeChange('student')}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 ${loginMode === 'student'
              ? 'bg-primary-600 text-white shadow-glow'
              : 'text-white/60 hover:text-white'
              }`}
          >
            <Users size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Student</span>
            <span className="sm:hidden">S</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleModeChange('admin')}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginMode === 'admin'
              ? 'bg-primary-600 text-white shadow-glow'
              : 'text-white/60 hover:text-white'
              }`}
          >
            <LogIn size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Admin</span>
            <span className="sm:hidden">A</span>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                {...register('email')}
                type="email"
                placeholder={loginMode === 'student' ? 'student@gmail.com' : 'admin@college.edu'}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 sm:mt-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Signing in...' : `Sign In as ${loginMode === 'admin' ? 'Admin' : 'Student'}`}
          </motion.button>
        </form>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-lg text-center">
          <p className="text-xs text-white/70">
            New here? Create a real student or admin account first.
          </p>
          <Link to={`/register?role=${loginMode}`} className="inline-flex mt-2 sm:mt-3 text-xs font-semibold text-accent-teal hover:text-white transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
