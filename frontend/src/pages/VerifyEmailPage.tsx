import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    const [code, setCode] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            toast.error('Email parameter missing. Please register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    const handleInput = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedCode = value.replace(/\D/g, '').slice(0, 4).split('');
            if (pastedCode.length > 0) {
                const newCode = [...code];
                pastedCode.forEach((digit, i) => {
                    if (index + i < 4) newCode[index + i] = digit;
                });
                setCode(newCode);

                // Focus the next empty input or the last one
                const nextEmptyIndex = newCode.findIndex(val => val === '');
                const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 3;
                inputsRef.current[focusIndex]?.focus();
            }
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Move to next input automatically
        if (value !== '' && index < 3) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (code[index] === '' && index > 0) {
                inputsRef.current[index - 1]?.focus();
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
            } else {
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            }
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 4) {
            toast.error('Please enter the full 4-digit code.');
            return;
        }

        if (!email) return;

        setLoading(true);
        try {
            await authService.verifyEmail(email, fullCode);
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Verification failed. Invalid code.');
            // Clear inputs on error
            setCode(['', '', '', '']);
            inputsRef.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-sm md:max-w-md lg:max-w-lg pointer-events-auto"
        >
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-center hover:bg-white/[0.05] transition-all duration-300 overflow-y-auto max-h-[90vh]">
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-accent-teal/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-teal/30">
                    <Mail size={24} className="text-accent-teal sm:w-7 sm:h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Verify your email</h1>
                <p className="text-white/70 text-xs sm:text-sm mb-6">
                    We sent a 4-digit verification code to <span className="font-semibold text-white">{email}</span>.
                    Enter it below to activate your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputsRef.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={4}
                                value={digit}
                                onChange={(e) => handleInput(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-11 h-12 sm:w-12 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                required
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.join('').length !== 4}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-glow"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" /> : (
                            <>Verify Code <ArrowRight size={16} className="sm:w-5 sm:h-5" /></>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/10"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
