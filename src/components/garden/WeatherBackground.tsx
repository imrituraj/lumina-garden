import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { WeatherState } from '../../store/useStore';

const Raindrops = memo(() => {
  // Generate 50 vertical raindrops
  const [drops] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`,
    animationDelay: `${Math.random() * 2}s`
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map(drop => (
        <motion.div
          key={drop.id}
          className="absolute top-0 w-0.5 h-10 bg-white/20 rounded-full"
          style={{ left: drop.left }}
          animate={{
            y: ['-10vh', '110vh'],
          }}
          transition={{
            duration: parseFloat(drop.animationDuration),
            repeat: Infinity,
            delay: parseFloat(drop.animationDelay),
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
});

const HeatHaze = memo(() => {
  const [particles] = useState(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 20 + Math.random() * 60,
    duration: 10 + Math.random() * 10
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute bg-white/10 rounded-full blur-xl"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
});

const getGradient = (state: WeatherState) => {
  switch (state) {
    case 'SUNNY': return 'linear-gradient(to bottom, #fde68a, #fbbf24)';
    case 'RAINY': return 'linear-gradient(to bottom, #1e293b, #334155)';
    case 'THUNDER': return 'linear-gradient(to bottom, #0D1B1E, #1e293b)';
    case 'NIGHT': return 'linear-gradient(to bottom, #0F172A, #000000)';
    case 'CLOUDY': return 'linear-gradient(to bottom, #94a3b8, #64748b)';
    default: return 'linear-gradient(to bottom, #1e293b, #0f172a)';
  }
};

const WeatherBackground: React.FC = () => {
  const { weatherState } = useStore();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const triggerFlash = () => {
      if (weatherState === 'THUNDER') {
        setFlash(true);
        setTimeout(() => setFlash(false), 100);
        
        // Next flash in 10-20 seconds
        const nextTime = 10000 + Math.random() * 10000;
        timeout = setTimeout(triggerFlash, nextTime);
      }
    };

    if (weatherState === 'THUNDER') {
      timeout = setTimeout(triggerFlash, 5000);
    }

    return () => clearTimeout(timeout);
  }, [weatherState]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={weatherState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: getGradient(weatherState) }}
        >
          {weatherState === 'SUNNY' && <HeatHaze />}
          {(weatherState === 'RAINY' || weatherState === 'THUNDER') && <Raindrops />}
        </motion.div>
      </AnimatePresence>

      {/* Thunder Flash Overlay */}
      {weatherState === 'THUNDER' && (
        <motion.div 
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: flash ? 0.3 : 0 }}
          transition={{ duration: 0.1 }}
        />
      )}
    </div>
  );
};

export default WeatherBackground;
