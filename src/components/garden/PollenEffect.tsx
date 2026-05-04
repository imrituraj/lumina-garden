import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
}

const PollenEffect: React.FC = () => {
  const { pollenReleaseTrigger } = useStore();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (pollenReleaseTrigger > 0) {
      // Spawn glowing pollen particles
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: Date.now() + i,
        startX: 40 + Math.random() * 20, // Start near the center bottom (e.g. from the plant)
        startY: 70 + Math.random() * 20,
        delay: Math.random() * 0.4,
        duration: 3 + Math.random() * 1.5
      }));
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticles(prev => [...prev, ...newParticles]);
      
      // Cleanup particles after animation completes
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 5000);
    }
  }, [pollenReleaseTrigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 0, 
              left: `${p.startX}vw`, 
              top: `${p.startY}vh`,
              scale: 0.5 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              // Move towards top-right corner (Global Forest Bar)
              left: [`${p.startX}vw`, `${p.startX + 15}vw`, '85vw'],
              top: [`${p.startY}vh`, `${p.startY - 30}vh`, '5vh'],
              scale: [0.5, 1.2, 0.8, 0],
              // Simulate organic sine wave movement
              x: [0, 40, -20, 30, -10, 0],
              y: [0, -20, 10, -15, 5, 0],
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay,
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1]
            }}
            className="absolute w-2 h-2 bg-amber-200 rounded-full"
            style={{
              filter: 'drop-shadow(0 0 6px #fbbf24)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PollenEffect;
