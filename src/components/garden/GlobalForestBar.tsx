import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

const GlobalForestBar: React.FC = () => {
  const { globalForestHealth, incrementGlobalForestHealth } = useStore();

  useEffect(() => {
    // Randomly increment to simulate global effort
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        incrementGlobalForestHealth(0.5 + Math.random() * 0.5); // Add 0.5-1% randomly
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [incrementGlobalForestHealth]);

  return (
    <div className="w-full max-w-md mx-auto group relative cursor-pointer z-40 mb-8">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2 text-white/90">
          <Globe2 size={16} className="text-emerald-400" />
          <span className="text-sm font-medium tracking-wide">Global Forest Vitality</span>
        </div>
        <span className="text-sm font-medium text-emerald-300">{Math.floor(globalForestHealth)}%</span>
      </div>
      
      <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm relative shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${globalForestHealth}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Subtle glow effect when filling */}
        {globalForestHealth > 0 && (
          <motion.div 
            className="absolute top-0 left-0 h-full w-full bg-emerald-400/20 blur-md"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 bg-slate-800/90 backdrop-blur-md text-white text-xs rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-xl">
        The collective effort of 1,432 gardeners is nourishing the world. Reach 100% for a Global Bloom.
      </div>
    </div>
  );
};

export default GlobalForestBar;
