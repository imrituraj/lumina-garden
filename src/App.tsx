import React, { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import GardenDashboard from './components/garden/GardenDashboard';
import QuizEngine from './components/quiz/QuizEngine';
import ZenAudio from './components/audio/ZenAudio';
import WeatherBackground from './components/garden/WeatherBackground';
import ActivityFeed from './components/garden/ActivityFeed';
import PollenEffect from './components/garden/PollenEffect';
import AlmanacModal from './components/almanac/AlmanacModal';
import { useStore } from './store/useStore';
import { initLiveWeatherMirror, fetchWeatherByCity } from './services/WeatherService';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';

function App() {
  const { activeQuizSubjectId, cityName } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize weather mirror on app mount
    initLiveWeatherMirror();
  }, []);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherByCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-foreground">
      
      {/* Background Visual Layer */}
      <WeatherBackground />

      {/* Global Particle Effects */}
      <PollenEffect />

      {/* Global Activity Feed */}
      <ActivityFeed />

      {/* Audio Layer */}
      <ZenAudio />
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full flex flex-col">
        
        {/* Fallback City Search Bar (Only visible if Geolocation denied or manual mode) */}
        <AnimatePresence>
          {cityName === 'Manual Mode' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-black/30 backdrop-blur-md border-b border-white/10 p-4 flex justify-center items-center z-40"
            >
              <form onSubmit={handleCitySearch} className="flex items-center gap-2 max-w-md w-full relative">
                <Search size={18} className="absolute left-3 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a city to set the weather..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-zen-primary"
                />
                <button type="submit" className="hidden">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative">
          <GardenDashboard />

          {/* Overlay Quiz Interface if active */}
          <AnimatePresence>
            {activeQuizSubjectId && <QuizEngine />}
          </AnimatePresence>
        </div>

        {/* Almanac Modal Overlay */}
        <AlmanacModal />
      </main>
    </div>
  );
}

export default App;
