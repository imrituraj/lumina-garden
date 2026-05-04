import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';

const SAMPLE_QUESTIONS = [
  { id: 1, text: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Tree", "Graph"], answer: 1, concept: "Stacks & Queues" },
  { id: 2, text: "What is the time complexity of binary search?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], answer: 2, concept: "Time Complexity" },
  { id: 3, text: "Which algorithm finds the shortest path?", options: ["DFS", "Kruskal's", "Dijkstra's", "Merge Sort"], answer: 2, concept: "Graph Algorithms" },
  { id: 4, text: "What does DOM stand for?", options: ["Document Object Model", "Data Object Model", "Document Oriented Model", "Dynamic Object Model"], answer: 0, concept: "Web Fundamentals" },
  { id: 5, text: "Which HTTP method is idempotent?", options: ["POST", "PATCH", "PUT", "CONNECT"], answer: 2, concept: "Networking" },
];

const MAX_QUESTIONS = 5;

const QuizEngine: React.FC = () => {
  const { activeQuizSubjectId, endQuiz, recordCorrectAnswer, subjects, resetStreak, recordQuizCompletion } = useStore();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedWrongOption, setSelectedWrongOption] = useState<number | null>(null);
  const [prevSubjectId, setPrevSubjectId] = useState(activeQuizSubjectId);

  // Session tracking
  const [sessionConceptsDiscovered, setSessionConceptsDiscovered] = useState<string[]>([]);
  const [sessionConceptsMissed, setSessionConceptsMissed] = useState<string[]>([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const triggerParticles = useCallback(() => {
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
  }, []);

  if (activeQuizSubjectId !== prevSubjectId) {
    setPrevSubjectId(activeQuizSubjectId);
    setCurrentQuestionIdx(0);
    setSelectedWrongOption(null);
    setSessionConceptsDiscovered([]);
    setSessionConceptsMissed([]);
    setSessionCorrect(0);
    setSessionTotal(0);
    setIsQuizComplete(false);
  }

  const subject = subjects.find(s => s.id === activeQuizSubjectId);
  const question = SAMPLE_QUESTIONS[currentQuestionIdx];

  if (!activeQuizSubjectId || !subject) return null;

  const handleOptionClick = (idx: number) => {
    const isCorrect = idx === question.answer;
    
    // Only count towards total if not already answered wrong for this question
    // But for simplicity, let's count every attempt
    setSessionTotal(prev => prev + 1);

    if (isCorrect) {
      triggerParticles();
      recordCorrectAnswer(subject.id);
      
      const newDiscovered = Array.from(new Set([...sessionConceptsDiscovered, question.concept]));
      setSessionConceptsDiscovered(newDiscovered);
      setSessionCorrect(prev => prev + 1);
      
      setTimeout(() => {
        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx >= Math.min(MAX_QUESTIONS, SAMPLE_QUESTIONS.length)) {
          // End of quiz
          recordQuizCompletion(subject.id, {
            accuracy: 0, // store computes it
            conceptsDiscovered: newDiscovered,
            conceptsMissed: sessionConceptsMissed,
            total: sessionTotal + 1,
            correct: sessionCorrect + 1
          });
          setIsQuizComplete(true);
        } else {
          setCurrentQuestionIdx(nextIdx);
          setSelectedWrongOption(null);
        }
      }, 600);
    } else {
      resetStreak();
      setSelectedWrongOption(idx);
      setIsShaking(true);
      setSessionConceptsMissed(prev => Array.from(new Set([...prev, question.concept])));
      setTimeout(() => setIsShaking(false), 400); // Shake duration
    }
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

          {!isQuizComplete ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-sm font-medium text-zen-primary uppercase tracking-widest mb-2">{subject.name}</h2>
                <h3 className="text-xl font-light text-slate-300">Question {currentQuestionIdx + 1} / {Math.min(MAX_QUESTIONS, SAMPLE_QUESTIONS.length)}</h3>
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
                        ? 'bg-zen-accent/10 border-zen-accent/50 text-zen-accent'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-6">
                <CheckCircle size={32} />
              </div>
              <h1 className="text-3xl font-medium text-white mb-4">Quiz Complete!</h1>
              <p className="text-lg text-white/70 mb-8">
                You got {sessionCorrect} out of {sessionTotal} attempts correct.
              </p>
              <button 
                onClick={endQuiz}
                className="clay-btn px-8 py-3 mx-auto flex items-center justify-center gap-2"
              >
                Return to Garden
              </button>
            </div>
          )}

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
