import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, User, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { authService } from '../services/auth.service';

export default function SignupPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await authService.signup(email, password, name);
      if (res.session) {
        navigate('/dashboard');
      } else if (res.user) {
        setSuccessMessage('Account created successfully! Please check your email inbox to confirm your email address before signing in.');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8 selection:bg-[#ffb800]/30 font-sans">
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-white border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Visual Area (Desktop 45% / Mobile Top Banner) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-amber-50/50 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-orange-100/80">
          
          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb800] text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5 fill-white text-[#ffb800]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0f172a]">checkd</span>
          </div>

          {/* Central Character Artwork */}
          <div className="relative z-10 my-8 flex flex-col items-center text-center">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-white/80 backdrop-blur-xs p-3 shadow-md border border-orange-100/80 overflow-hidden mb-6 flex items-center justify-center">
              <motion.img
                animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                src="/images/boy.png"
                alt="Create your Checkd profile"
                className="w-full h-full object-cover object-center mix-blend-multiply opacity-95 rounded-2xl"
              />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0f172a]">Start your journey</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xs leading-relaxed font-normal">
              Build better daily health habits, track your wellness, and understand your lab reports with Checkd.
            </p>
          </div>

          {/* Trust Footer Note */}
          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-xs p-2.5 px-4 rounded-full border border-slate-200/60 shadow-2xs self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Educational platform • 100% Private</span>
          </div>

          {/* Ambient Background Accents */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-100/30 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right Form Area (Desktop 55%) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Create your account</h1>
              <p className="mt-1.5 text-sm text-slate-500 font-normal">
                Join Checkd to personalize your health dashboard and daily check-in routine.
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

            {/* Email Confirmation Success Box */}
            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl bg-emerald-50/90 p-6 border border-emerald-200/80 text-center space-y-4 shadow-2xs"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Account Created</h3>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">{successMessage}</p>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center justify-center w-full rounded-xl bg-[#0f172a] px-5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
                >
                  Go to Sign in
                </Link>
              </motion.div>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 transition-all focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 focus:outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

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
                  <label htmlFor="password" className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 transition-all focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-slate-500 mb-3 text-center leading-normal">
                    By signing up, you agree to Checkd's Privacy Policy and educational terms.
                  </p>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-[#0f172a] px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2"
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4 text-[#ffb800]" />}
                    </button>
                  </motion.div>
                </div>
              </form>
            )}

            {/* Navigation Link to Login */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#0f172a] hover:text-[#ffb800] transition-colors underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
