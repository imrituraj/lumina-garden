import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Droplets, MapPin, Sun, CloudRain, CloudLightning, Moon, Cloud, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { WeatherState } from '../../store/useStore';
import PlantComponent from './PlantComponent';

const WeatherIcon = ({ state }: { state: WeatherState }) => {
  switch (state) {
    case 'SUNNY': return <Sun size={20} className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />;
    case 'RAINY': return <CloudRain size={20} className="text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]" />;
    case 'THUNDER': return <CloudLightning size={20} className="text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" />;
    case 'NIGHT': return <Moon size={20} className="text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.8)]" />;
    case 'CLOUDY': return <Cloud size={20} className="text-slate-300" />;
    default: return <Sun size={20} />;
  }
};

const GardenDashboard: React.FC = () => {
  const { subjects, startQuiz, checkWiltStatus, cityName, weatherState, getWateringEfficiency } = useStore();
  const efficiency = getWateringEfficiency();

  useEffect(() => {
    checkWiltStatus();
    const interval = setInterval(checkWiltStatus, 60000);
    return () => clearInterval(interval);
  }, [checkWiltStatus]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full h-full px-6 lg:px-12 py-10 overflow-y-auto">
      <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-semibold text-white mb-2 tracking-tight drop-shadow-md">Your Garden</h1>
          <p className="text-white/70 font-light text-lg">Study to sustain. Nurture your knowledge.</p>
        </div>
        
        {/* Live Weather Widget */}
        <div className="glass-panel px-5 py-3.5 flex items-center gap-5 shrink-0 rounded-full">
          <div className="flex items-center gap-2.5 text-white/90 border-r border-white/20 pr-5">
            <MapPin size={18} className="text-teal-400" />
            <span className="text-sm font-medium tracking-wide">{cityName}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <WeatherIcon state={weatherState} />
            <span className="text-sm font-medium text-white/90 capitalize tracking-wide">{weatherState.toLowerCase()}</span>
          </div>
        </div>
      </header>

      {/* Environmental Boost Notice */}
      {efficiency > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-5 rounded-2xl bg-white/10 border border-teal-400/30 flex items-center gap-4 text-white shadow-glow backdrop-blur-md"
        >
          <div className="bg-teal-400/20 p-2.5 rounded-xl">
            <Zap className="animate-pulse text-teal-400" size={24} />
          </div>
          <div>
            <span className="font-semibold block text-base tracking-wide text-teal-300">Environmental Boost Active!</span>
            <span className="text-sm text-white/70">Rainy weather increases watering efficiency. <strong className="text-white">5 answers = 1 Drop!</strong></span>
          </div>
        </motion.div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
      >
        {subjects.map((subject) => (
          <motion.div 
            key={subject.id}
            variants={itemVariants}
            className="glass-panel p-8 flex flex-col items-center justify-between group relative"
          >
            {/* Subject Header */}
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-xl font-medium text-white tracking-wide drop-shadow-sm">{subject.name}</h3>
              <div className="flex items-center gap-1.5 text-teal-300 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                <Droplets size={16} />
                <span>{subject.waterUnits}</span>
              </div>
            </div>

            {/* Plant SVG */}
            <div className="flex-1 flex items-center justify-center py-6 w-full">
              <PlantComponent 
                growthLevel={subject.growthLevel} 
                isWilted={subject.isWilted} 
              />
            </div>

            {/* Progress & Action */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-[13px] font-medium text-white/60 mb-3 tracking-wide uppercase">
                <span>Next Water Drop</span>
                <span className="text-white/90">{Math.floor(subject.correctAnswersProgress)} / 10</span>
              </div>
              
              <div className="w-full bg-black/20 rounded-full h-2 mb-8 overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(subject.correctAnswersProgress / 10) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <button 
                onClick={() => startQuiz(subject.id)}
                className="w-full clay-btn py-3.5 flex items-center justify-center gap-2.5 text-[15px]"
              >
                <Play size={18} fill="currentColor" />
                Study Now
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GardenDashboard;
