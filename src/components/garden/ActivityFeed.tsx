import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_MESSAGES = [
  "A gardener in Kolkata just planted a Lotus.",
  "The Forest is glowing—someone just hit a 20-question streak!",
  "A student in Tokyo watered an Oak tree.",
  "Global vitality increased by 1%!",
  "A gardener in London mastered Data Structures.",
];

interface Toast {
  id: number;
  message: string;
}

const ActivityFeed: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const showRandomToast = () => {
      const msg = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      const newToast = { id: Date.now(), message: msg };
      
      setToasts(prev => {
        const next = [...prev, newToast];
        return next.slice(-2); // Max 2 visible
      });

      // Disappear after 5s
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000); 

      // Schedule next notification (10 to 25 seconds)
      timeoutId = setTimeout(showRandomToast, 10000 + Math.random() * 15000);
    };

    timeoutId = setTimeout(showRandomToast, 5000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 0.5, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 shadow-lg max-w-xs"
          >
            <p className="text-[13px] text-white/80 font-light tracking-wide">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ActivityFeed;
