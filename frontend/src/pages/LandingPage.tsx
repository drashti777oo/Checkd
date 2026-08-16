import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Brain, CheckCircle2, Activity, Heart, Moon, Zap, Smile, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffcf8] overflow-hidden selection:bg-[#ffb800]/30">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 z-10"
          >
            <div className="inline-flex items-center rounded-full bg-yellow-100/50 border border-yellow-200 px-3 py-1.5 text-sm font-medium text-yellow-800">
              <Sparkles className="h-4 w-4 text-yellow-600 mr-2" />
              Your health, your journey.
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-[#0f172a] sm:text-6xl md:text-7xl leading-[1.1]">
              Understand your health.<br/>
              <span className="text-[#ef4444]">Take action.</span>
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
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white px-8 text-base font-semibold text-[#0f172a] transition-colors hover:border-slate-300 w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full border-2 border-white object-cover"
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt=""
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600">Loved by 1000+ users</p>
            </div>
          </motion.div>

          {/* Right Illustration & UI Mockup Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex justify-center items-center"
          >
            {/* Background Blob/Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl opacity-60"></div>
            
            {/* Floating UI Card Mockup */}
            <div className="relative z-20 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a]">Good morning, Anya! <span className="text-xl">👋</span></h3>
                  <p className="text-sm text-slate-500">Here's your latest check-in</p>
                </div>
                <div className="text-right text-[#ef4444] font-serif italic text-lg opacity-60">
                  better<br/>you ♥
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <Zap className="h-5 w-5 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#0f172a]">72%</div>
                  <div className="text-xs text-green-700 font-medium mt-1">Good</div>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 text-center">
                  <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#0f172a]">42%</div>
                  <div className="text-xs text-red-700 font-medium mt-1">Moderate</div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <Moon className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#0f172a]">7h 15m</div>
                  <div className="text-xs text-indigo-700 font-medium mt-1">Sleep</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h4 className="text-sm font-semibold text-[#0f172a] mb-3">How are you feeling right now?</h4>
                <div className="flex justify-between">
                  {['Great', 'Good', 'Okay', 'Not great', 'Struggling'].map((mood, i) => (
                    <div key={mood} className="flex flex-col items-center gap-1 cursor-pointer">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 ${i === 1 ? 'bg-green-100 shadow-sm' : 'grayscale opacity-50'}`}>
                        {i === 0 ? '😄' : i === 1 ? '🙂' : i === 2 ? '😐' : i === 3 ? '😔' : '😫'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{mood}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative character placeholders (CSS shapes mimicking the illustration vibe) */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-100 rounded-full blur-2xl opacity-60 -z-10"></div>
            <div className="absolute top-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full blur-2xl opacity-60 -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section className="border-y border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a]">Privacy & secure</h3>
                <p className="text-sm text-slate-500">Your data is always protected.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a]">Personalized for you</h3>
                <p className="text-sm text-slate-500">Insights that adapt to your unique needs.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a]">Backed by science</h3>
                <p className="text-sm text-slate-500">Evidence-based approach you can trust.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a]">Actionable insights</h3>
                <p className="text-sm text-slate-500">Simple steps to help you feel better every day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Checkd Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-serif text-[#0f172a] mb-3">How Checkd works</h2>
        <p className="text-slate-600 mb-16">A simple 3-step process for a healthier you.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px border-t-2 border-dashed border-slate-200 -z-10"></div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold border-4 border-[#fffcf8]">01</div>
            <div className="h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center">
              <Search className="h-16 w-16 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Check</h3>
            <p className="text-slate-500">Take a quick check-in about your mood, sleep, energy, stress, and more.</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold border-4 border-[#fffcf8]">02</div>
            <div className="h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center">
              <Activity className="h-16 w-16 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Understand</h3>
            <p className="text-slate-500">We analyze your patterns and give you clear insights about your well-being.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold border-4 border-[#fffcf8]">03</div>
            <div className="h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center">
              <TrendingUpIcon className="h-16 w-16 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Improve</h3>
            <p className="text-slate-500">Get personalized recommendations to build habits that help you feel your best.</p>
          </div>
        </div>
      </section>

      {/* Why users love Checkd */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-serif text-center text-[#0f172a] mb-12">Why users love Checkd</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="bg-red-50 p-3 rounded-xl text-red-500"><Heart className="h-6 w-6"/></div>
            <div>
              <h4 className="font-semibold text-sm text-[#0f172a]">Holistic insights</h4>
              <p className="text-xs text-slate-500 mt-0.5">Treat your mind and body as one whole.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500"><Zap className="h-6 w-6"/></div>
            <div>
              <h4 className="font-semibold text-sm text-[#0f172a]">Easy & quick</h4>
              <p className="text-xs text-slate-500 mt-0.5">Check in anytime, it only takes a minute.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-500"><Smile className="h-6 w-6"/></div>
            <div>
              <h4 className="font-semibold text-sm text-[#0f172a]">Personal & supportive</h4>
              <p className="text-xs text-slate-500 mt-0.5">Insights that feel like a supportive friend.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="bg-green-50 p-3 rounded-xl text-green-500"><Leaf className="h-6 w-6"/></div>
            <div>
              <h4 className="font-semibold text-sm text-[#0f172a]">Build better habits</h4>
              <p className="text-xs text-slate-500 mt-0.5">Small daily actions that reward health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#fff7ed] rounded-[3rem] p-12 sm:p-16 border border-orange-100 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold font-serif text-[#0f172a] mb-4">Ready to start your journey?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Your health is personal. Your check-ins should be too. Start your first check and take a step toward a better you.
            </p>
            <Link
              to="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#0f172a] px-8 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Start your check now &rarr;
            </Link>
          </div>

          {/* Decorative floating icons */}
          <div className="absolute top-12 left-12 h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 rotate-12"><Moon className="h-6 w-6"/></div>
          <div className="absolute bottom-12 left-24 h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 -rotate-12"><Zap className="h-6 w-6"/></div>
          <div className="absolute top-24 right-20 h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 rotate-6"><Heart className="h-6 w-6"/></div>
          <div className="absolute bottom-20 right-32 h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-yellow-500 -rotate-6"><Smile className="h-6 w-6"/></div>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Trusted by thousands. Designed with care.
        </p>
      </section>

    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
