import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bell, Eye, EyeOff, Lock, Mail, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';

const schema = z
    .object({
        name: z.string().min(2, 'Enter your full name'),
        email: z.string().email('Enter a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm your password'),
        role: z.enum(['student', 'admin']),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRole = (searchParams.get('role') === 'admin' ? 'admin' : 'student') as 'student' | 'admin';

    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: initialRole },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await authService.register({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            });

            toast.success('Account created. Check your email for the verification code.');
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Could not create account.');
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
                <div className="text-center mb-6 sm:mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="w-14 sm:w-16 h-14 sm:h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"
                    >
                        <Bell size={24} className="text-white sm:w-7 sm:h-7" />
                    </motion.div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Create Account</h1>
                    <p className="text-white/50 text-xs sm:text-sm">Register a real student or admin account</p>
                </div>

                <div className="flex gap-2 mb-6 sm:mb-8 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        type="button"
                        onClick={() => setValue('role', 'student', { shouldDirty: true, shouldValidate: true })}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 ${selectedRole === 'student' ? 'bg-primary-600 text-white shadow-glow' : 'text-white/60 hover:text-white'}`}
                    >
                        <Users size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Student</span>
                        <span className="sm:hidden">S</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('role', 'admin', { shouldDirty: true, shouldValidate: true })}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 ${selectedRole === 'admin' ? 'bg-primary-600 text-white shadow-glow' : 'text-white/60 hover:text-white'}`}
                    >
                        <UserPlus size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Admin</span>
                        <span className="sm:hidden">A</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    <input type="hidden" {...register('role')} />

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">Full Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder={selectedRole === 'admin' ? 'admin@college.edu' : 'student@gmail.com'}
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
                                placeholder="Create a strong password"
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

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                            <input
                                {...register('confirmPassword')}
                                type={showPass ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                            />
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 sm:mt-2"
                    >
                        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Creating account...' : `Create ${selectedRole === 'admin' ? 'Admin' : 'Student'} Account`}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
