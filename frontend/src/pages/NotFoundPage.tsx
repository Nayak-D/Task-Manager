import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-primary-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center"
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
          className="text-[120px] sm:text-[180px] font-black text-white/5 leading-none select-none"
        >
          404
        </motion.div>

        <div className="-mt-8 sm:-mt-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-5"
          >
            <span className="text-3xl">🔍</span>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
            >
              <ArrowLeft size={15} /> Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-glow"
            >
              <Home size={15} /> Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
