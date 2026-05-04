import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GrowthLevel } from '../../store/useStore';

interface PlantComponentProps {
  growthLevel: GrowthLevel;
  isWilted: boolean;
}

const PlantComponent: React.FC<PlantComponentProps> = ({ growthLevel, isWilted }) => {
  const wiltFilter = isWilted ? 'grayscale(90%) brightness(0.7) sepia(20%)' : 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))';
  
  const getPlantSVG = () => {
    switch (growthLevel) {
      case 0: // Seed (in dirt)
        return (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
             <ellipse cx="50" cy="78" rx="12" ry="6" fill="url(#dirtGradient)" />
             <ellipse cx="50" cy="75" rx="6" ry="4" fill="url(#seedGradient)" />
             <path d="M48 73 Q 50 68 53 72" fill="none" stroke="#A3E635" strokeWidth="1.5" strokeLinecap="round" />
          </motion.g>
        );
      case 1: // Sprout
        return (
          <motion.g initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ opacity: 0 }}>
             {/* Stem */}
             <path d="M50 78 Q 45 60, 50 45" fill="none" stroke="url(#stemGradient)" strokeWidth="4.5" strokeLinecap="round" />
             {/* Leaves */}
             <path d="M50 60 Q 25 45, 45 40 Q 55 50, 50 60" fill="url(#leafGradientDark)" />
             <path d="M50 50 Q 75 40, 55 30 Q 45 40, 50 50" fill="url(#leafGradientLight)" />
          </motion.g>
        );
      case 2: // Sapling
        return (
          <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
             {/* Main Stem */}
             <path d="M50 78 Q 40 40, 50 15" fill="none" stroke="url(#stemGradient)" strokeWidth="6" strokeLinecap="round" />
             {/* Leaves Left */}
             <path d="M48 50 Q 15 35, 35 25 Q 48 35, 48 50" fill="url(#leafGradientDark)" />
             <path d="M45 30 Q 10 15, 30 5 Q 45 15, 45 30" fill="url(#leafGradientLight)" />
             {/* Leaves Right */}
             <path d="M52 60 Q 85 45, 65 35 Q 52 45, 52 60" fill="url(#leafGradientDark)" />
             <path d="M51 25 Q 90 10, 70 0 Q 55 10, 51 25" fill="url(#leafGradientLight)" />
          </motion.g>
        );
      case 3: // Flowering
        return (
          <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
             {/* Main Stem */}
             <path d="M50 78 Q 40 40, 50 20" fill="none" stroke="url(#stemGradient)" strokeWidth="6" strokeLinecap="round" />
             {/* Leaves */}
             <path d="M48 50 Q 10 35, 30 20 Q 48 35, 48 50" fill="url(#leafGradientDark)" />
             <path d="M52 60 Q 90 45, 70 30 Q 52 45, 52 60" fill="url(#leafGradientDark)" />
             {/* Glowing Flower/Orb */}
             <motion.circle 
               cx="50" cy="15" r="14" fill="url(#flowerGradient)" 
               animate={{ filter: ["drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))", "drop-shadow(0 0 25px rgba(245, 158, 11, 0.9))", "drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             />
             <circle cx="50" cy="15" r="6" fill="#FEF3C7" />
             {/* Floating particles around flower */}
             <motion.circle cx="30" cy="5" r="2" fill="#FDE68A" animate={{ y: [-5, 5, -5], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
             <motion.circle cx="70" cy="10" r="1.5" fill="#FDE68A" animate={{ y: [5, -5, 5], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} />
          </motion.g>
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-end h-48 w-48">
      <motion.svg 
        viewBox="0 0 100 150" 
        className="w-full h-full overflow-visible"
        style={{ filter: wiltFilter }}
        animate={isWilted ? { rotateZ: [0, 6, 0], transformOrigin: "50% 100%" } : { rotateZ: [0, 1.5, -1.5, 0], transformOrigin: "50% 100%" }}
        transition={{ duration: isWilted ? 4 : 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          {/* Gradients for 3D effect */}
          <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="potRimGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="leafGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="leafGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="dirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#290E01" />
          </linearGradient>
          <linearGradient id="seedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        <AnimatePresence mode="wait">
          <motion.g key={`plant-level-${growthLevel}`}>
            {getPlantSVG()}
          </motion.g>
        </AnimatePresence>
        
        {/* The 3D Pot */}
        <path d="M22 80 L30 140 L70 140 L78 80 Z" fill="url(#potGradient)" />
        {/* Pot Rim */}
        <rect x="16" y="70" width="68" height="12" rx="4" fill="url(#potRimGradient)" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }} />
        {/* Inner dirt shadow */}
        <ellipse cx="50" cy="80" rx="30" ry="4" fill="#0F172A" opacity="0.6" />
      </motion.svg>
      
      {isWilted && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-4 text-xs font-bold text-rose-200 bg-rose-500/30 px-3 py-1.5 rounded-full border border-rose-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          Needs Water!
        </motion.div>
      )}
    </div>
  );
};

export default PlantComponent;
