import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export function CtaSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="pb-24 px-4 sm:px-6 lg:px-8 relative z-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="max-w-6xl mx-auto rounded-[2rem] relative overflow-hidden"
        style={{
          background: 'linear-gradient(120deg, #ffe8d6 0%, #fdf0e8 30%, #f0ebff 70%, #e8e0ff 100%)',
          boxShadow: '0 8px 48px 0 rgba(180,120,80,0.10), 0 2px 16px 0 rgba(120,80,180,0.08)',
        }}
      >
        {/* Inner layout: left image | center content | right image */}
        <div className="flex items-end justify-between min-h-[280px] sm:min-h-[320px]">

          {/* Left Character — Meditation Girl */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
            className="hidden md:flex flex-shrink-0 self-end w-52 lg:w-64 xl:w-72 pointer-events-none select-none"
          >
            <img
              src="/images/medate.png"
              alt="Meditation girl illustration"
              className="w-full object-contain object-bottom mix-blend-multiply"
              style={{ maxHeight: '320px' }}
            />
          </motion.div>

          {/* Central Content */}
          <div className="flex-1 flex flex-col items-center text-center px-6 py-12 sm:py-16 relative z-10 min-w-0">

            {/* Pill Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-rose-200/60 text-rose-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-5"
            >
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              Your health, your priority
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0f172a] tracking-tight leading-tight mb-4"
            >
              Ready to start your{' '}
              <br className="hidden sm:block" />
              <span style={{ color: '#e05c7a' }}>health journey?</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-sm mb-7"
            >
              Your health is personal. Your check-ins should be too.
              <br />
              Start your first check-in and take a confident step toward daily wellness.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -2 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                className="inline-block group"
              >
                <Link
                  to="/signup"
                  className="inline-flex h-13 items-center justify-center rounded-full bg-[#0f172a] px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2"
                >
                  Start Your Check Now
                  <ArrowRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Badges Row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
            >
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                100% Private
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                <svg className="h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure &amp; Encrypted
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                Backed by Science
              </div>
            </motion.div>
          </div>

          {/* Right Character — Boy Sitting */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
            className="hidden md:flex flex-shrink-0 self-end w-52 lg:w-64 xl:w-72 pointer-events-none select-none"
          >
            <img
              src="/images/boy.png"
              alt="Boy sitting illustration"
              className="w-full object-contain object-bottom mix-blend-multiply"
              style={{ maxHeight: '300px' }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
