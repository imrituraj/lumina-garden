import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileQuestion, GraduationCap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Subject, SubjectMastery } from '../../store/useStore';
import confetti from 'canvas-confetti';

// SVGs for plants. Simple minimalist paths.
const PlantSVG: React.FC<{ type: string; accuracy: number }> = ({ type, accuracy }) => {
  const isBlurry = accuracy < 50;
  const isFullRender = accuracy > 80;

  let pathData = "M 10 90 Q 50 10 90 90 Z"; // Fallback simple leaf
  if (type === 'ds') { // Fern
    pathData = "M 50 100 Q 50 50 20 20 M 50 100 Q 50 60 80 30 M 50 100 L 50 0 M 50 70 Q 30 50 10 40 M 50 70 Q 70 50 90 40";
  } else if (type === 'apt') { // Monstera
    pathData = "M 50 100 Q 30 50 50 10 Q 80 20 90 60 Q 60 90 50 100 M 50 100 Q 70 50 50 10 Q 20 20 10 60 Q 40 90 50 100";
  } else if (type === 'os') { // Bonsai
    pathData = "M 40 100 L 60 100 L 55 60 Q 80 50 70 20 Q 50 10 30 20 Q 20 50 45 60 Z";
  }

  return (
    <div className={`relative w-32 h-32 mx-auto my-4 transition-all duration-700 ${isBlurry ? 'blur-[4px] sepia-[0.8]' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-800 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={pathData} />
        {/* Draw details if not blurry */}
        {!isBlurry && (
          <path d="M 50 100 L 50 10" strokeWidth="1" strokeDasharray="2 2" className="stroke-emerald-600/50" />
        )}
      </svg>
      {isFullRender && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-lg shadow-amber-500/40 border-2 border-orange-200"
        >
          <GraduationCap size={16} />
        </motion.div>
      )}
    </div>
  );
};

const AlmanacCard: React.FC<{ subject: Subject; mastery: SubjectMastery | undefined }> = ({ subject, mastery }) => {
  const [showMissing, setShowMissing] = useState(false);
  const accuracy = mastery?.accuracy || 0;
  const isFullRender = accuracy > 80;
  const { startQuiz, toggleAlmanac } = useStore();

  const handleRefresher = () => {
    toggleAlmanac();
    startQuiz(subject.id);
  };

  const onHoverStart = () => {
    if (isFullRender && !sessionStorage.getItem(`confetti_${subject.id}`)) {
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#10B981', '#34D399', '#059669'],
        origin: { y: 0.6 }
      });
      sessionStorage.setItem(`confetti_${subject.id}`, 'true');
    }
  };

  return (
    <motion.div 
      whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
      onHoverStart={onHoverStart}
      className={`relative w-full aspect-[3/4] bg-[#fdf6e3]/80 rounded-sm border p-6 flex flex-col shadow-md overflow-hidden ${isFullRender ? 'border-amber-400/60 shadow-amber-400/20 shadow-xl' : 'border-slate-300'}`}
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")'
      }}
    >
      <div className="text-center mb-2 shrink-0">
        <h3 className="font-serif text-lg text-emerald-900 border-b border-emerald-900/20 pb-2 inline-block px-4">{subject.name}</h3>
      </div>

      <PlantSVG type={subject.id} accuracy={accuracy} />

      <div className="flex-1 font-['Caveat'] text-xl text-slate-700 leading-tight flex flex-col justify-end pb-4 overflow-y-auto">
        {accuracy < 50 ? (
          <p className="opacity-70 italic text-center">"Specimen undocumented. Requires further study..."</p>
        ) : (
          <div className="space-y-2">
            <p><strong className="text-emerald-800">Discovered:</strong> {mastery?.conceptsDiscovered?.join(', ') || 'None'}</p>
            {(mastery?.conceptsMissed?.length ?? 0) > 0 && (
              <div className="mt-2">
                <button 
                  onClick={() => setShowMissing(!showMissing)}
                  className="flex items-center gap-1 text-orange-700 hover:text-orange-800 transition-colors"
                >
                  <FileQuestion size={16} /> 
                  <span>Missing Pages...</span>
                </button>
                <AnimatePresence>
                  {showMissing && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-orange-800/80 pl-5 mt-1 overflow-hidden text-lg"
                    >
                      {mastery?.conceptsMissed?.join(', ')}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-emerald-900/10 shrink-0">
        <button 
          onClick={handleRefresher}
          className="w-full py-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded font-serif text-sm transition-colors"
        >
          Return to Field
        </button>
      </div>
    </motion.div>
  );
};

const AlmanacModal: React.FC = () => {
  const { isAlmanacOpen, toggleAlmanac, subjects, masteryLog } = useStore();

  if (!isAlmanacOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: 90 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-8 lg:p-12 perspective-[2000px]"
        style={{ perspective: 2000 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleAlmanac} />
        
        <div className="relative w-full max-w-5xl h-full max-h-[800px] bg-[#fdf6e3] rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E")'
          }}
        >
          <header className="flex justify-between items-center p-6 border-b border-emerald-900/10 shrink-0">
            <div>
              <h2 className="font-serif text-3xl text-emerald-900 tracking-wide">Knowledge Archive</h2>
              <p className="font-['Caveat'] text-xl text-slate-600 mt-1">Botanical sketches of your mental garden.</p>
            </div>
            <button onClick={toggleAlmanac} className="p-2 text-emerald-900 hover:bg-emerald-900/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subjects.map(subject => (
                <AlmanacCard key={subject.id} subject={subject} mastery={masteryLog[subject.id]} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlmanacModal;
