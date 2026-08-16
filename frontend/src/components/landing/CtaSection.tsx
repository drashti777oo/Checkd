import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, Heart, Leaf } from 'lucide-react';

export function CtaSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const leftImageVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 0.95,
      x: 0,
      transition: { duration: 0.7, delay: 0.3, ease: 'easeOut' },
    },
  };

  const rightImageVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 0.95,
      x: 0,
      transition: { duration: 0.7, delay: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <section className="pb-24 px-4 sm:px-6 lg:px-8 relative z-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="max-w-5xl mx-auto bg-[#fff7ed] rounded-[2.5rem] p-10 sm:p-16 border border-orange-200/80 shadow-lg relative overflow-hidden flex flex-col items-center text-center"
      >
        {/* Left Character Illustration */}
        <motion.div
          variants={leftImageVariants}
          animate={shouldReduceMotion ? {} : { y: [0, -6, 0], rotate: [0, 1.5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="hidden md:block absolute -left-8 -bottom-8 w-64 h-64 pointer-events-none select-none z-0"
        >
          <img
            src="/images/mia-meditation-alt.jpg"
            alt="Mia meditation illustration"
            className="w-full h-full object-cover rounded-tr-[4rem] mix-blend-multiply opacity-90"
          />
        </motion.div>

        {/* Right Character Illustration */}
        <motion.div
          variants={rightImageVariants}
          animate={shouldReduceMotion ? {} : { y: [0, -6, 0], rotate: [0, -1.5, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.5 }}
          className="hidden md:block absolute -right-8 -bottom-8 w-64 h-64 pointer-events-none select-none z-0"
        >
          <img
            src="/images/arjun-sitting.jpg"
            alt="Arjun sitting illustration"
            className="w-full h-full object-cover rounded-tl-[4rem] mix-blend-multiply opacity-90"
          />
        </motion.div>

        {/* Central Content */}
        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#0f172a] tracking-tight">
            Ready to start your health journey?
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Your health is personal. Your check-ins should be too.<br />
            Start your first check and take a confident step toward daily wellness.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-3">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="inline-block group"
            >
              <Link
                to="/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#0f172a] px-9 text-base font-semibold text-white shadow-md transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2"
              >
                Start Your Check Now
                <ArrowRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Geometric & Soft Accent Elements (NO emojis) */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-8 left-1/4 h-10 w-10 bg-white rounded-full shadow-xs flex items-center justify-center text-rose-500 border border-slate-100/80"
            >
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.6 }}
              className="absolute bottom-12 left-1/3 h-10 w-10 bg-white rounded-full shadow-xs flex items-center justify-center text-emerald-600 border border-slate-100/80"
            >
              <ShieldCheck className="h-5 w-5" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -7, 0], rotate: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-12 right-1/4 h-10 w-10 bg-white rounded-full shadow-xs flex items-center justify-center text-amber-500 border border-slate-100/80"
            >
              <Leaf className="h-5 w-5" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Footer Trust Note */}
      <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-2 font-medium">
        <Lock className="h-3.5 w-3.5 text-slate-400" />
        <span>Educational platform. Designed with privacy & care.</span>
      </p>
    </section>
  );
}
