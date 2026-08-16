import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { authService } from '../services/auth.service';

export default function LoginPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8 selection:bg-[#ffb800]/30 font-sans">
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-white border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Visual Panel */}
        <div
          className="lg:col-span-5 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-orange-100/40 p-8 sm:p-10"
          style={{ background: 'linear-gradient(160deg, #fff3e6 0%, #fffaf4 40%, #f0f8f0 100%)' }}
        >
          {/* Ambient blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

          {/* Brand Logo */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffb800] shadow-sm">
              <CheckCircle2 className="h-5 w-5 fill-white text-[#ffb800]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0f172a]">checkd</span>
          </div>

          {/* Central Illustration + Text */}
          <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center py-6">

            {/* Image card with floating decorative accents */}
            <div className="relative mb-7">
              {/* Soft white card behind image */}
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-[2rem] bg-white/75 shadow-lg border border-orange-100/60 flex items-center justify-center overflow-hidden">
                <motion.img
                  animate={shouldReduceMotion ? {} : { y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  src="/images/mia-meditation.jpg"
                  alt="Wellness meditation illustration"
                  className="w-full h-full object-cover object-center mix-blend-multiply"
                />
              </div>

              {/* Floating accent — star top-left */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -5, 0], rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute -top-3 -left-4 text-amber-400 text-xl pointer-events-none select-none"
              >
                ✦
              </motion.div>

              {/* Floating accent — leaf top-right */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -6, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -top-2 -right-3 text-emerald-400 text-lg pointer-events-none select-none"
              >
                🌿
              </motion.div>

              {/* Floating accent — heart right-center */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.6 }}
                className="absolute top-1/2 -right-5 -translate-y-1/2 text-rose-400 text-base pointer-events-none select-none"
              >
                ♡
              </motion.div>

              {/* Floating accent — moon bottom-right */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 0.9 }}
                className="absolute -bottom-3 -right-5 text-slate-300 text-base pointer-events-none select-none"
              >
                🌙
              </motion.div>
            </div>

            {/* Welcome Text */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-2 flex items-center gap-2">
              Welcome back <span className="text-amber-400">🤍</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] font-normal">
              Your daily wellness journey continues here.
            </p>
          </div>

          {/* Bottom Trust Badges */}
          <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/70 border border-slate-200/60 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
              Private
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 border border-slate-200/60 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <ShieldCheck className="h-3 w-3 text-blue-500 shrink-0" />
              Secure
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 border border-slate-200/60 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <span className="text-emerald-500 text-xs shrink-0">✿</span>
              Wellness-focused
            </div>
          </div>
        </div>

        {/* Right Login Form Area (Desktop 55%) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-7">
            
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Sign in to your account</h1>
              <p className="mt-1.5 text-sm text-slate-500 font-normal">
                Enter your credentials to continue your daily wellness tracking.
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email-address" className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 transition-all focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#0f172a]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 transition-all focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-[#0f172a] px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4 text-[#ffb800]" />}
                </button>
              </motion.div>
            </form>

            {/* Navigation Link to Signup */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account yet?{' '}
                <Link to="/signup" className="font-semibold text-[#0f172a] hover:text-[#ffb800] transition-colors underline underline-offset-4">
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
