import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Zap, Calendar, Leaf } from 'lucide-react';

export function WhyChooseUsSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const cardsData = [
    {
      title: 'Holistic Overview',
      description: 'Combine subjective daily check-ins with objective PDF lab test results.',
      icon: Heart,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      accentColor: 'hover:text-rose-600',
      borderColor: 'hover:border-rose-200/80',
      shadowGlow: 'hover:shadow-rose-100/60',
      iconHoverAnim: { scale: [1, 1.15, 1], transition: { duration: 0.4 } },
    },
    {
      title: 'Quick & Accessible',
      description: 'Daily check-ins take under 30 seconds with zero complicated forms.',
      icon: Zap,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      accentColor: 'hover:text-indigo-600',
      borderColor: 'hover:border-indigo-200/80',
      shadowGlow: 'hover:shadow-indigo-100/60',
      iconHoverAnim: { scale: 1.15, rotate: 5 },
    },
    {
      title: 'Optional Cycle Tracker',
      description: 'Gated menstrual cycle predictions and period logs for female profiles.',
      icon: Calendar,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accentColor: 'hover:text-amber-600',
      borderColor: 'hover:border-amber-200/80',
      shadowGlow: 'hover:shadow-amber-100/60',
      iconHoverAnim: { y: -3, scale: 1.1 },
    },
    {
      title: 'Educational Insights',
      description: 'Understand your lab metrics in plain language without scary medical jargon.',
      icon: Leaf,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accentColor: 'hover:text-emerald-600',
      borderColor: 'hover:border-emerald-200/80',
      shadowGlow: 'hover:shadow-emerald-100/60',
      iconHoverAnim: { rotate: [0, 10, -5, 0], scale: 1.1 },
    },
  ];

  return (
    <section id="why-checkd" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 overflow-hidden">
      
      {/* Soft Blurred Background Ambient Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-rose-50/30 via-indigo-50/20 to-emerald-50/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Section Heading with Motion Reveal */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="text-center mb-14 space-y-3"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold font-serif text-[#0f172a] tracking-tight">
          Why users choose Checkd
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-normal">
          Designed to help you build everyday health awareness through simple, intelligent tracking.
        </motion.p>
      </motion.div>

      {/* Four Column Cards Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.015 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`bg-white/90 backdrop-blur-xs p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-lg ${card.shadowGlow} ${card.borderColor} transition-all duration-300 flex flex-col justify-between h-full group cursor-default`}
              >
                <div>
                  {/* Icon Container with Hover Animation */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : card.iconHoverAnim}
                    transition={{ duration: 0.3 }}
                    className={`${card.bgColor} w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconColor} mb-5 shadow-2xs border border-slate-100 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className={`font-bold text-[#0f172a] text-lg mb-2 ${card.accentColor} transition-colors tracking-tight`}>
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Subtle Accent Bottom Line */}
                <div className="w-full h-1 bg-slate-100 rounded-full mt-6 group-hover:bg-slate-200 transition-colors overflow-hidden">
                  <div className={`w-0 group-hover:w-full h-full transition-all duration-500 ease-out bg-current ${card.iconColor}`} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
