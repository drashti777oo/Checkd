import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Heart, Sparkles, Moon, Droplets, Smile, Zap, Leaf } from 'lucide-react';
import { AnimatedConnector } from './AnimatedConnector';

export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  // Staggered Animation Container Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const underlineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: '80px',
      opacity: 1,
      transition: { duration: 0.7, delay: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 overflow-hidden">
      
      {/* Decorative Organic Background Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-100/30 via-orange-50/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-36 left-8 text-amber-300/40 text-4xl pointer-events-none select-none">✨</div>
      <div className="absolute bottom-20 right-10 text-emerald-300/40 text-4xl pointer-events-none select-none">🌿</div>

      {/* Section Heading & Subtitle */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="flex flex-col items-center space-y-3 mb-16"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold font-serif text-[#0f172a] tracking-tight">
          How Checkd works
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium">
          A simple 3-step process for a healthier you.
        </motion.p>

        <motion.div variants={underlineVariants} className="h-1.5 bg-[#ffb800] rounded-full mt-2" />
      </motion.div>

      {/* 3 Step Cards Grid with Flow Connectors */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={containerVariants}
        className="flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-0 relative z-10"
      >
        {/* CARD 01 — CHECK */}
        <motion.div variants={itemVariants} className="flex-1 flex flex-col">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.015 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 text-left flex flex-col justify-between h-full relative group"
          >
            <div className="space-y-4">
              {/* Number Badge & Icon Header */}
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-[#ffb800] text-white flex items-center justify-center font-bold text-base shadow-sm border-2 border-white">
                  01
                </div>
                <div className="h-9 w-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              {/* Card Image Illustration Container */}
              <div className="h-48 bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-2xl overflow-hidden relative border border-amber-100/60 flex items-center justify-center">
                <motion.img
                  animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  src="/images/mia-phone.jpg"
                  alt="Check in preview illustration"
                  className="w-full h-full object-cover object-top mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Check-in Badge Accent */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#0f172a]"
                >
                  <Smile className="h-3.5 w-3.5 text-amber-500" /> Daily Vitals
                </motion.div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-2 tracking-tight group-hover:text-amber-600 transition-colors">
                  Check
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Take a quick check-in about your mood, sleep, energy, stress and more.
                </p>
              </div>
            </div>

            {/* Bottom Pill */}
            <div className="pt-6 border-t border-slate-100/80 mt-6">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 group-hover:bg-amber-100/80 transition-colors">
                Quick • Easy • Personal
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Vertical Connector */}
        <AnimatedConnector orientation="vertical" className="lg:hidden" />

        {/* Desktop Horizontal Connector 1 */}
        <AnimatedConnector orientation="horizontal" className="self-center" />

        {/* CARD 02 — UNDERSTAND */}
        <motion.div variants={itemVariants} className="flex-1 flex flex-col">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.015 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 text-left flex flex-col justify-between h-full relative group"
          >
            <div className="space-y-4">
              {/* Number Badge & Icon Header */}
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-[#ffb800] text-white flex items-center justify-center font-bold text-base shadow-sm border-2 border-white">
                  02
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              {/* Card Image Illustration + Floating Mini Data Cards */}
              <div className="h-48 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 rounded-2xl overflow-hidden relative border border-blue-100/60 flex items-center justify-center">
                <img
                  src="/images/arjun-sitting.jpg"
                  alt="Understand health data analysis illustration"
                  className="w-full h-full object-cover scale-[1.25] translate-y-3 mix-blend-multiply opacity-95 group-hover:scale-[1.3] transition-transform duration-500"
                />

                {/* Staggered Floating Mini-Data Cards */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-xs border border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-800"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Mood: Great
                </motion.div>

                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-xs border border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700"
                >
                  <Moon className="h-3.5 w-3.5 text-indigo-500" /> Sleep: 7h 15m
                </motion.div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                  Understand
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We analyze your patterns and give you clear insights about your well-being.
                </p>
              </div>
            </div>

            {/* Bottom Pill */}
            <div className="pt-6 border-t border-slate-100/80 mt-6">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 group-hover:bg-blue-100/80 transition-colors">
                AI-Powered • Insightful
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Vertical Connector */}
        <AnimatedConnector orientation="vertical" className="lg:hidden" />

        {/* Desktop Horizontal Connector 2 */}
        <AnimatedConnector orientation="horizontal" className="self-center" />

        {/* CARD 03 — IMPROVE */}
        <motion.div variants={itemVariants} className="flex-1 flex flex-col">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.015 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 text-left flex flex-col justify-between h-full relative group"
          >
            <div className="space-y-4">
              {/* Number Badge & Icon Header */}
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-[#ffb800] text-white flex items-center justify-center font-bold text-base shadow-sm border-2 border-white">
                  03
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5 fill-emerald-600 text-emerald-600" />
                </div>
              </div>

              {/* Card Image Illustration + Floating Wellness Accents */}
              <div className="h-48 bg-gradient-to-b from-emerald-50/70 to-teal-50/40 rounded-2xl overflow-hidden relative border border-emerald-100/60 flex items-center justify-center">
                <img
                  src="/images/mia-meditation.jpg"
                  alt="Improve health habits illustration"
                  className="w-full h-full object-cover object-center mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Wellness Icons */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -6, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                  className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-1.5 rounded-full shadow-xs border border-slate-100 flex items-center justify-center text-emerald-600"
                >
                  <Leaf className="h-4 w-4" />
                </motion.div>

                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.4 }}
                  className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 px-3 rounded-full shadow-xs border border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-blue-700"
                >
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> Hydration
                </motion.div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-2 tracking-tight group-hover:text-emerald-600 transition-colors">
                  Improve
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Get personalized recommendations and build habits that help you feel your best.
                </p>
              </div>
            </div>

            {/* Bottom Pill */}
            <div className="pt-6 border-t border-slate-100/80 mt-6">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 group-hover:bg-emerald-100/80 transition-colors">
                Personalized • Actionable • Better You
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Soft Highlight Message Bar Below Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-14 max-w-2xl mx-auto bg-amber-50/80 backdrop-blur-xs rounded-full py-3.5 px-6 border border-amber-200/70 shadow-2xs text-center"
      >
        <p className="text-xs sm:text-sm font-semibold text-amber-900 flex items-center justify-center gap-2">
          <span>Small steps. Real change. A better you, every day. 💛</span>
        </p>
      </motion.div>

    </section>
  );
}
