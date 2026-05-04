import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';

const SAMPLE_QUESTIONS = [
  { id: 1, text: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Tree", "Graph"], answer: 1 },
  { id: 2, text: "What is the time complexity of binary search?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], answer: 2 },
  { id: 3, text: "Which algorithm finds the shortest path?", options: ["DFS", "Kruskal's", "Dijkstra's", "Merge Sort"], answer: 2 },
];

const QuizEngine: React.FC = () => {
  const { activeQuizSubjectId, endQuiz, recordCorrectAnswer, subjects } = useStore();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedWrongOption, setSelectedWrongOption] = useState<number | null>(null);

  const subject = subjects.find(s => s.id === activeQuizSubjectId);
  const question = SAMPLE_QUESTIONS[currentQuestionIdx];

  useEffect(() => {
    if (!activeQuizSubjectId) {
      setCurrentQuestionIdx(0);
      setSelectedWrongOption(null);
    }
  }, [activeQuizSubjectId]);

  if (!activeQuizSubjectId || !subject) return null;

  const handleOptionClick = (idx: number) => {
    if (idx === question.answer) {
      // Correct!
      triggerParticles();
      recordCorrectAnswer(subject.id);
      
      // Next question or loop
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
        setSelectedWrongOption(null);
      }, 600);
    } else {
      // Incorrect
      setSelectedWrongOption(idx);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Shake duration
    }
  };

  const triggerParticles = () => {
    const duration = 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#14B8A6', '#10B981', '#F59E0B']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#14B8A6', '#10B981', '#F59E0B']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const shakeVariants = {
    shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } },
    idle: { x: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
      >
        {/* Slow moving ambient gradient background */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
           <motion.div 
             className="absolute w-[500px] h-[500px] rounded-full bg-zen-primary/10 blur-[100px]"
             animate={{ 
               x: [0, 100, -100, 0],
               y: [0, -100, 100, 0]
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           />
        </div>

        <div className="glass-panel w-full max-w-2xl p-8 relative">
          <button 
            onClick={endQuiz}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="mb-8 text-center">
            <h2 className="text-sm font-medium text-zen-primary uppercase tracking-widest mb-2">{subject.name}</h2>
            <h3 className="text-xl font-light text-slate-300">Question {currentQuestionIdx + 1} / {SAMPLE_QUESTIONS.length}</h3>
          </div>

          <motion.div 
            variants={shakeVariants}
            animate={isShaking ? "shake" : "idle"}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl font-medium text-white leading-relaxed">
              {question.text}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick(idx)}
                className={`p-5 rounded-2xl text-left border transition-all duration-300 text-lg ${
                  selectedWrongOption === idx 
                    ? 'bg-zen-accent/10 border-zen-accent/50 text-zen-accent' // Soft amber for wrong
                    : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zen-primary animate-pulse"></span>
                Zen Mode Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizEngine;
