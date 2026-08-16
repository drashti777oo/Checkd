import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedConnectorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function AnimatedConnector({ orientation = 'horizontal', className = '' }: AnimatedConnectorProps) {
  const shouldReduceMotion = useReducedMotion();

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
        <svg width="24" height="48" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line
            x1="12"
            y1="0"
            x2="12"
            y2="40"
            stroke="#ffb800"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          {!shouldReduceMotion && (
            <motion.circle
              cx="12"
              cy="0"
              r="4"
              fill="#ffb800"
              animate={{ cy: [0, 40] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
            />
          )}
          <polygon points="6,38 18,38 12,46" fill="#ffb800" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`hidden lg:flex items-center justify-center relative w-24 xl:w-32 z-10 ${className}`}>
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <path
          d="M 5 20 Q 60 5, 115 20"
          stroke="#ffb800"
          strokeWidth="2.5"
          strokeDasharray="5 5"
          strokeLinecap="round"
          fill="none"
        />
        {!shouldReduceMotion && (
          <motion.circle
            r="4"
            fill="#ffb800"
            animate={{
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'linear',
            }}
            style={{
              offsetPath: 'path("M 5 20 Q 60 5, 115 20")',
            }}
          />
        )}
        <polygon points="110,14 118,20 110,26" fill="#ffb800" />
      </svg>
    </div>
  );
}
