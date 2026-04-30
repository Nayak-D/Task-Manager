import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        let active = true;

        authService.verifyEmail(token)
            .then(() => {
                if (!active) return;
                setStatus('success');
                setMessage('Email verified successfully. You can log in now.');
                toast.success('Email verified successfully.');
                setTimeout(() => navigate('/login'), 1800);
            })
            .catch((err: any) => {
                if (!active) return;
                setStatus('error');
                setMessage(err?.response?.data?.message || 'Verification failed.');
            });

        return () => {
            active = false;
        };
    }, [navigate, searchParams]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg md:mr-32 pointer-events-auto"
        >
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl text-center hover:bg-white/[0.05] transition-all duration-300">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-white/10 bg-white/10">
                            {status === 'loading' && <Loader2 size={28} className="text-primary-300 animate-spin" />}
                            {status === 'success' && <CheckCircle2 size={28} className="text-emerald-400" />}
                            {status === 'error' && <MailWarning size={28} className="text-red-400" />}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {status === 'success' ? 'Verification complete' : status === 'error' ? 'Verification failed' : 'Verifying...'}
                        </h1>
                        <p className="text-white/70 text-sm mb-6">{message}</p>

                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm transition-all shadow-glow"
                        >
                            Go to Login
                        </Link>
                    </div>
        </motion.div>
    );
}
