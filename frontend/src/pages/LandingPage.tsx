import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Brain, CheckCircle2, Heart, Zap, Smile } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffcf8] overflow-hidden selection:bg-[#ffb800]/30 font-sans">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-24 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative space-y-7 z-10 lg:pr-8"
          >
            <div className="inline-flex items-center rounded-full bg-yellow-100/50 border border-yellow-200 px-3 py-1.5 text-sm font-medium text-yellow-800">
              <span className="mr-2 text-yellow-500">⭐</span>
              Your health, your journey.
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-[#0f172a] sm:text-6xl md:text-7xl leading-[1.1]">
              Understand your health.<br/>
              Take action.
            </h1>
            
            <p className="max-w-xl text-lg text-slate-600 leading-relaxed">
              Checkd helps you check in, understand your body and mind, and build better habits with personalized insights and simple daily actions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#0f172a] px-8 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 w-full sm:w-auto"
              >
                Start a Check
                <span className="ml-2 bg-[#ffb800] text-[#0f172a] rounded-full p-1 border border-[#0f172a]">
                  <ArrowRightIcon className="h-3 w-3" />
                </span>
              </Link>
              <Link
                to="#how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-semibold text-[#0f172a] transition-colors hover:border-slate-300 w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
            
            <div className="inline-flex items-center gap-4 mt-6 bg-white rounded-full p-2 pr-6 border border-slate-100 shadow-sm">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt=""
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-600">Loved by 50K+ users</p>
            </div>
          </motion.div>

          {/* Right Illustration & UI Mockup Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center mt-16 lg:mt-0 w-full"
          >
            <div className="relative w-full max-w-[460px]">
              {/* Floating UI Card Mockup */}
              <div className="relative z-20 w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6 transform hover:-translate-y-1 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f172a]">Good morning, Anaya! 👋</h3>
                    <p className="text-sm text-slate-500 mt-1">Here's your overview for today</p>
                  </div>
                  <div className="text-right text-green-500 font-serif italic text-lg leading-tight">
                    better<br/>you ♥
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                    <div className="text-xs text-green-700 font-medium mb-1">Energy</div>
                    <div className="text-2xl font-bold text-green-600">72%</div>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                    <div className="text-xs text-red-700 font-medium mb-1">Stress</div>
                    <div className="text-2xl font-bold text-red-500">42%</div>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
                    <div className="text-xs text-indigo-700 font-medium mb-1">Sleep</div>
                    <div className="text-xl font-bold text-indigo-600">7h 15m</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-sm font-semibold text-[#0f172a] mb-4 text-center">How are you feeling right now?</h4>
                  <div className="flex justify-between relative">
                    {[
                      { emoji: '😄', label: 'Great' },
                      { emoji: '🙂', label: 'Good' },
                      { emoji: '😐', label: 'Okay' },
                      { emoji: '😟', label: 'Not good' },
                      { emoji: '😫', label: 'Struggling' }
                    ].map((mood, i) => (
                      <div key={mood.label} className="flex flex-col items-center gap-2 cursor-pointer relative">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-transform hover:scale-110 ${i === 1 ? 'bg-white shadow-sm ring-2 ring-green-400' : 'grayscale opacity-50'}`}>
                          {mood.emoji}
                        </div>
                        {i === 1 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full text-white p-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                        <span className={`text-[10px] font-medium ${i === 1 ? 'text-[#0f172a]' : 'text-slate-400'}`}>{mood.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Environment Particles */}
              <motion.div 
                className="absolute -left-16 sm:-left-32 top-10 text-yellow-400 text-2xl z-20 drop-shadow-sm"
                animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="absolute -left-4 sm:-left-10 bottom-32 text-green-400 text-3xl z-40 drop-shadow-sm"
                animate={{ y: [0, -20, 0], rotate: [0, 15, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              >
                🌿
              </motion.div>
              <motion.div 
                className="absolute -right-10 sm:-right-20 top-20 text-red-400 text-2xl z-20 drop-shadow-sm"
                animate={{ y: [0, -15, 0], scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              >
                💖
              </motion.div>

              {/* Mia - positioned at bottom left of card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -left-12 sm:-left-32 -bottom-4 sm:-bottom-12 w-[220px] sm:w-[320px] z-30"
              >
                <MiaDrinkingAnimation />
              </motion.div>

              {/* Arjun - positioned at bottom right of card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -right-[320px] sm:-right-[490px] -bottom-10 sm:-bottom-24 w-[420px] sm:w-[650px] z-30"
              >
                <ArjunAnimation />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section id="features" className="border-y border-slate-200/60 bg-white/50 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Private & secure</h3>
                <p className="text-xs text-slate-500">Your data is always protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Personalized for you</h3>
                <p className="text-xs text-slate-500">Insights that adapt to your unique needs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Backed by science</h3>
                <p className="text-xs text-slate-500">Evidence-based approach you can trust</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 relative">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0f172a]">Actionable insights</h3>
                <p className="text-xs text-slate-500">Simple steps to help you feel better every day</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Checkd Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f172a] mb-4">How Checkd works</h2>
        <p className="text-slate-600 mb-16 text-lg">A simple 3-step process for a healthier you.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative text-left flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-[#ffb800] text-white flex items-center justify-center font-bold text-lg border-4 border-[#fffcf8] z-10 shadow-sm">01</div>
            <div className="h-48 bg-[#fff7ed] rounded-2xl mb-6 overflow-hidden relative border border-orange-50">
              <img src="/images/mia-phone.jpg" alt="Check" className="w-full h-full object-cover object-top mix-blend-multiply opacity-90" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Check</h3>
            <p className="text-slate-500 leading-relaxed flex-grow">Take a quick check-in about your mood, sleep, energy, stress and more.</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative text-left flex flex-col h-full mt-4 md:mt-0 hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-[#ffb800] text-white flex items-center justify-center font-bold text-lg border-4 border-[#fffcf8] z-10 shadow-sm">02</div>
            <div className="h-48 bg-[#fff7ed] rounded-2xl mb-6 overflow-hidden relative border border-orange-50">
              <img src="/images/arjun-sitting.jpg" alt="Understand" className="w-full h-full object-cover scale-[1.2] translate-y-4 mix-blend-multiply opacity-90" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Understand</h3>
            <p className="text-slate-500 leading-relaxed flex-grow">We analyze your patterns and give you clear insights about your well-being.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative text-left flex flex-col h-full mt-4 md:mt-0 hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-[#ffb800] text-white flex items-center justify-center font-bold text-lg border-4 border-[#fffcf8] z-10 shadow-sm">03</div>
            <div className="h-48 bg-[#fff7ed] rounded-2xl mb-6 overflow-hidden relative border border-orange-50">
              <img src="/images/mia-meditation.jpg" alt="Improve" className="w-full h-full object-cover object-center mix-blend-multiply opacity-90" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Improve</h3>
            <p className="text-slate-500 leading-relaxed flex-grow">Get personalized recommendations and build habits that help you feel your best.</p>
          </div>
        </div>
      </section>

      {/* Why users love Checkd */}
      <section id="why-checkd" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm rounded-3xl mb-24">
        <h2 className="text-3xl font-bold font-serif text-center text-[#0f172a] mb-12">Why users love Checkd</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center text-red-500 mb-4"><Heart className="h-6 w-6"/></div>
            <h4 className="font-bold text-[#0f172a] mb-2">Holistic insights</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Track your mind and body in one place.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-500 mb-4"><Zap className="h-6 w-6"/></div>
            <h4 className="font-bold text-[#0f172a] mb-2">Easy & quick</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Check in anytime, it only takes a minute.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center text-orange-500 mb-4"><Smile className="h-6 w-6"/></div>
            <h4 className="font-bold text-[#0f172a] mb-2">Personal & supportive</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Insights that feel like a supportive friend.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center text-green-500 mb-4"><Leaf className="h-6 w-6"/></div>
            <h4 className="font-bold text-[#0f172a] mb-2">Build better habits</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Small daily actions lead to real change.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#fff7ed] rounded-[2rem] p-12 sm:p-16 border border-orange-100 shadow-lg relative overflow-hidden flex flex-col items-center text-center">
          
          {/* Images Absolutely Positioned on Left and Right */}
          <div className="hidden md:block absolute -left-8 -bottom-8 w-64 h-64 opacity-90">
            <img src="/images/mia-meditation-alt.jpg" alt="Mia sitting" className="w-full h-full object-cover rounded-tr-[4rem] mix-blend-multiply" />
          </div>
          
          <div className="hidden md:block absolute -right-8 -bottom-8 w-64 h-64 opacity-90">
            <img src="/images/arjun-sitting.jpg" alt="Arjun sitting" className="w-full h-full object-cover rounded-tl-[4rem] mix-blend-multiply" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0f172a] mb-4">Ready to start your journey?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Your health is personal. Your check-ins should be too.<br/>Start your first check and take a step toward a better you.
            </p>
            <Link
              to="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#0f172a] px-8 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Start your check now <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Decorative floating icons */}
          <div className="absolute top-8 left-1/4 h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center text-red-500 text-lg rotate-12">❤️</div>
          <div className="absolute bottom-12 left-1/3 h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center text-green-500 text-lg -rotate-12">✅</div>
          <div className="absolute top-16 right-1/4 h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center text-yellow-500 text-lg rotate-6">😊</div>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-8 flex items-center justify-center gap-2">
          <span>🔒 Trusted by thousands. Designed with care.</span>
        </p>
      </section>

    </div>
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
  // Sequence: slow continuous movement
  const sequence = [1, 2, 3, 4, 3, 2];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sequence.length);
    }, 1500); // 1.5 seconds per frame - very slow
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-end justify-center">
      {/* We map over the 4 images, but only show the one matching the current sequence step */}
      {[1, 2, 3, 4].map((num) => (
        <img
          key={num}
          src={`/images/${num}-mia.png`}
          alt={`Mia frame ${num}`}
          className={`absolute bottom-0 left-0 w-full h-auto object-contain drop-shadow-lg mix-blend-multiply transition-opacity duration-[1000ms] ease-in-out ${
            sequence[index] === num ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
    </div>
  );
}

function ArjunAnimation() {
  // Sequence of frame numbers: 1, 2, 3, 4, 6, 4, 3, 2
  const sequence = [1, 2, 3, 4, 6, 4, 3, 2];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sequence.length);
    }, 1500); // 1.5 seconds per frame - matches Mia's speed
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-end justify-center">
      {/* We map over the 5 images, but only show the one matching the current sequence step */}
      {[1, 2, 3, 4, 6].map((num) => (
        <img
          key={num}
          src={`/images/a-${num}.png`}
          alt={`Arjun frame ${num}`}
          className={`absolute bottom-0 left-0 w-full h-auto object-contain drop-shadow-lg mix-blend-multiply transition-opacity duration-[1000ms] ease-in-out ${
            sequence[index] === num ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
    </div>
  );
}
