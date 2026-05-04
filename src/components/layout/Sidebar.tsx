import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Store, Globe2, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Sidebar: React.FC = () => {
  const { totalXP } = useStore();

  const navItems = [
    { icon: Leaf, label: "My Garden", active: true },
    { icon: Store, label: "Seed Shop", active: false },
    { icon: Globe2, label: "Global Forest", active: false },
  ];

  return (
    <div className="w-24 lg:w-[280px] m-6 mr-0 h-[calc(100vh-3rem)] py-8 px-4 flex flex-col justify-between glass-panel z-10">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center lg:justify-start gap-4 px-3 mb-14">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-glow shrink-0">
            <Leaf className="text-white" size={26} strokeWidth={2} />
          </div>
          <h1 className="hidden lg:block text-2xl font-semibold text-white tracking-tight">
            Lumina
            <span className="text-white/60 font-light">Garden</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button 
                key={index}
                className={`relative flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  item.active 
                    ? 'text-white' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                {item.active && (
                  <motion.div 
                    layoutId="activeNavBackground" 
                    className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent border-l-4 border-teal-400 -z-10" 
                  />
                )}
                <Icon size={22} className={item.active ? 'text-teal-400' : 'group-hover:scale-110 transition-transform duration-300'} />
                <span className="hidden lg:block font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Stats Bottom */}
      <div className="flex flex-col items-center lg:items-start gap-2 px-2">
        <div className="w-full flex items-center justify-center lg:justify-start gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="bg-amber-500/20 p-2 rounded-xl">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-amber-500/70 mb-0.5">Total XP</div>
            <div className="font-bold text-2xl leading-none">{totalXP}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
