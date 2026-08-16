import { Link } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            Your health, simplified.
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Understand your health.<br className="hidden sm:block" /> Take action.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            Checkd helps you understand your body's signals, offering simple, AI-powered explanations and actionable recommendations for a healthier you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 w-full sm:w-auto"
            >
              Start a Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 w-full sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to stay on top of your health
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We translate complex medical terminology into simple, actionable steps.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                title: 'Check',
                description: 'Provide your health details through a simple, guided process.',
                icon: Activity,
              },
              {
                title: 'Understand',
                description: 'Get clear, AI-powered explanations of your results without the jargon.',
                icon: ShieldCheck,
              },
              {
                title: 'Improve',
                description: 'Receive personalized recommendations to help you feel your best.',
                icon: TrendingUp,
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-slate-50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
