import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Brain, CheckCircle2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { WhyChooseUsSection } from '../components/landing/WhyChooseUsSection';
import { CtaSection } from '../components/landing/CtaSection';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#fffcf8] overflow-x-hidden selection:bg-[#ffb800]/30 font-sans">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-10 pb-20 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative space-y-7 z-10 lg:pr-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/60 border border-amber-200/80 px-3.5 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs">
              <span className="text-amber-500">✨</span>
              Your health data, organized around you.
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-[#0f172a] sm:text-6xl md:text-7xl leading-[1.1]">
              Understand your health.<br/>
              <span className="relative inline-block mt-2 text-[#0f172a] bg-[#ffb800] px-4 py-1 rounded-2xl shadow-sm border border-[#0f172a]/10">
                Take action.
              </span>
            </h1>
            
            <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Checkd helps you check in daily, understand lab reports, and build healthier habits with personalized insights and clear, actionable steps.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#0f172a] px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 w-full sm:w-auto"
                >
                  Start a Check
                  <span className="ml-2.5 bg-[#ffb800] text-[#0f172a] rounded-full p-1 border border-[#0f172a]">
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href="#how-it-works"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-semibold text-[#0f172a] shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 w-full sm:w-auto"
                >
                  Learn More
                </a>
              </motion.div>
            </div>
            
            {/* Truthful Product Statement Badge */}
            <div className="inline-flex items-center gap-3 mt-6 bg-white/90 backdrop-blur-sm rounded-full p-2.5 px-5 border border-slate-200/80 shadow-2xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Built for better everyday health — Private, Personal & Secure
              </p>
            </div>
          </motion.div>

          {/* Right Illustration & UI Mockup Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center mt-12 lg:mt-0 w-full"
          >
            <div className="relative w-full max-w-[460px]">
              {/* Floating UI Card Mockup */}
              <div className="relative z-20 w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6 transform hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f172a]">Good morning, Anaya! 👋</h3>
                    <p className="text-xs text-slate-500 mt-1">Here's your daily wellness overview</p>
                  </div>
                  <div className="text-right text-emerald-600 font-serif italic text-lg leading-tight">
                    better<br/>you ♥
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50/80 rounded-2xl p-3.5 text-center border border-emerald-100">
                    <div className="text-[11px] text-emerald-700 font-semibold mb-0.5">Energy</div>
                    <div className="text-xl font-bold text-emerald-600">72%</div>
                  </div>
                  <div className="bg-rose-50/80 rounded-2xl p-3.5 text-center border border-rose-100">
                    <div className="text-[11px] text-rose-700 font-semibold mb-0.5">Stress</div>
                    <div className="text-xl font-bold text-rose-500">42%</div>
                  </div>
                  <div className="bg-indigo-50/80 rounded-2xl p-3.5 text-center border border-indigo-100">
                    <div className="text-[11px] text-indigo-700 font-semibold mb-0.5">Sleep</div>
                    <div className="text-lg font-bold text-indigo-600">7h 15m</div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                  <h4 className="text-xs font-semibold text-[#0f172a] mb-3 text-center">How are you feeling right now?</h4>
                  <div className="flex justify-between relative">
                    {[
                      { emoji: '😄', label: 'Great' },
                      { emoji: '🙂', label: 'Good' },
                      { emoji: '😐', label: 'Okay' },
                      { emoji: '😟', label: 'Not good' },
                      { emoji: '😫', label: 'Struggling' }
                    ].map((mood, i) => (
                      <div key={mood.label} className="flex flex-col items-center gap-1.5 cursor-pointer relative">
                        <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all ${i === 1 ? 'bg-white shadow-sm ring-2 ring-emerald-500 scale-105' : 'grayscale opacity-50'}`}>
                          {mood.emoji}
                        </div>
                        {i === 1 && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full text-white p-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                        <span className={`text-[10px] font-medium ${i === 1 ? 'text-[#0f172a] font-semibold' : 'text-slate-400'}`}>{mood.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ambient Floating Accents */}
              <motion.div 
                className="absolute -left-16 sm:-left-32 top-10 text-amber-400 text-2xl z-20 drop-shadow-xs"
                animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="absolute -left-4 sm:-left-10 bottom-32 text-emerald-400 text-3xl z-40 drop-shadow-xs"
                animate={{ y: [0, -15, 0], rotate: [0, 10, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.8 }}
              >
                🌿
              </motion.div>
              <motion.div 
                className="absolute -right-10 sm:-right-20 top-20 text-rose-400 text-2xl z-20 drop-shadow-xs"
                animate={{ y: [0, -12, 0], scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.4 }}
              >
                💖
              </motion.div>

              {/* Mia - positioned at bottom left of card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -left-12 sm:-left-32 -bottom-4 sm:-bottom-12 w-[220px] sm:w-[320px] z-30 drop-shadow-sm"
              >
                <MiaDrinkingAnimation />
              </motion.div>

              {/* Arjun - positioned at bottom right of card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -right-[320px] sm:-right-[490px] -bottom-10 sm:-bottom-24 w-[420px] sm:w-[650px] z-30 drop-shadow-sm"
              >
                <ArjunAnimation />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section id="features" className="border-y border-slate-200/60 bg-white/60 backdrop-blur-sm relative z-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5 p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Private & Secure</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted user-scoped health profile and data isolation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Personalized Onboarding</h3>
                <p className="text-xs text-slate-500 mt-0.5">Adapts dashboard metrics to your health goals and background.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Lab Report PDF Parser</h3>
                <p className="text-xs text-slate-500 mt-0.5">Extracts structured metrics from uploaded bloodwork and lab reports.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Educational AI Explanations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Plain-language summaries and custom actionable next steps.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Checkd Works Section (Interactive Component) */}
      <HowItWorksSection />

      {/* Why Users Choose Checkd Section (Interactive Component) */}
      <WhyChooseUsSection />

      {/* Bottom CTA Section (Interactive Component) */}
      <CtaSection />

    </main>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function MiaDrinkingAnimation() {
  const sequence = [1, 2, 3, 4, 3, 2];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sequence.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-end justify-center">
      {[1, 2, 3, 4].map((num) => (
        <img
          key={num}
          src={`/images/${num}-mia.png`}
          alt={`Mia character animation frame ${num}`}
          className={`absolute bottom-0 left-0 w-full h-auto object-contain drop-shadow-md mix-blend-multiply transition-opacity duration-[1000ms] ease-in-out ${
            sequence[index] === num ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
    </div>
  );
}

function ArjunAnimation() {
  const sequence = [1, 2, 3, 4, 6, 4, 3, 2];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sequence.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-end justify-center">
      {[1, 2, 3, 4, 6].map((num) => (
        <img
          key={num}
          src={`/images/a-${num}.png`}
          alt={`Arjun character animation frame ${num}`}
          className={`absolute bottom-0 left-0 w-full h-auto object-contain drop-shadow-md mix-blend-multiply transition-opacity duration-[1000ms] ease-in-out ${
            sequence[index] === num ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
    </div>
  );
}
