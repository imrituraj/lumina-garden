import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, Flame, ChevronUp, ChevronDown, X } from 'lucide-react';

type TimerPreset = {
  label: string;
  minutes: number;
  icon: React.ReactNode;
  color: string;
};

const PRESETS: TimerPreset[] = [
  { label: 'Focus', minutes: 25, icon: <Brain size={16} />, color: 'from-teal-400 to-emerald-400' },
  { label: 'Short Break', minutes: 5, icon: <Coffee size={16} />, color: 'from-amber-400 to-orange-400' },
  { label: 'Long Break', minutes: 15, icon: <Coffee size={16} />, color: 'from-indigo-400 to-purple-400' },
  { label: 'Deep Work', minutes: 50, icon: <Flame size={16} />, color: 'from-rose-400 to-pink-400' },
];

const StudyTimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // default 25 min
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setSessionsCompleted((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds]);

  const selectPreset = useCallback((idx: number) => {
    const preset = PRESETS[idx];
    setActivePresetIdx(idx);
    setTotalSeconds(preset.minutes * 60);
    setRemainingSeconds(preset.minutes * 60);
    setIsRunning(false);
    setShowCustom(false);
  }, []);

  const applyCustom = useCallback(() => {
    const clamped = Math.max(1, Math.min(180, customMinutes));
    setTotalSeconds(clamped * 60);
    setRemainingSeconds(clamped * 60);
    setIsRunning(false);
    setActivePresetIdx(-1);
    setShowCustom(false);
  }, [customMinutes]);

  const toggleTimer = () => {
    if (remainingSeconds === 0) {
      // Reset before starting
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning((r) => !r);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  // Format time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG circle progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const activeColor = activePresetIdx >= 0 
    ? PRESETS[activePresetIdx].color 
    : 'from-violet-400 to-fuchsia-400';

  // --- Compact card (shown in grid) ---
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 flex flex-col items-center justify-between group relative cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <h3 className="text-xl font-medium text-white tracking-wide drop-shadow-sm">Study Timer</h3>
          <div className="flex items-center gap-1.5 text-amber-300 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
            <Flame size={16} />
            <span>{sessionsCompleted}</span>
          </div>
        </div>

        {/* Timer Preview */}
        <div className="flex-1 flex items-center justify-center py-6 w-full">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Glow ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${activeColor} opacity-10 blur-xl`} />
            
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Track */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              {/* Progress */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke="url(#timerGradientPreview)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="timerGradientPreview" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-white tracking-tight tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-white/40 mt-1">
                {isRunning ? 'Running' : remainingSeconds === 0 ? 'Done!' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="w-full mt-6">
          <div className="flex justify-between text-[13px] font-medium text-white/60 mb-3 tracking-wide uppercase">
            <span>Sessions</span>
            <span className="text-white/90">{sessionsCompleted} completed</span>
          </div>

          <div className="w-full bg-black/20 rounded-full h-2 mb-8 overflow-hidden shadow-inner border border-white/5">
            <motion.div
              className={`bg-gradient-to-r ${activeColor} h-full rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="w-full clay-btn py-3.5 flex items-center justify-center gap-2.5 text-[15px]"
          >
            <Timer size={18} />
            Open Timer
          </button>
        </div>
      </motion.div>
    );
  }

  // --- Full expanded timer overlay ---
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <motion.div
            className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br ${activeColor} opacity-[0.08] blur-[120px]`}
            animate={{
              x: [0, 80, -80, 0],
              y: [0, -80, 80, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ top: '20%', left: '30%' }}
          />
        </div>

        <div className="glass-panel w-full max-w-lg p-10 relative">
          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-sm font-medium text-teal-400 uppercase tracking-[0.2em] mb-2">Study Timer</h2>
            <p className="text-white/50 text-sm">Stay focused. Stay growing.</p>
          </div>

          {/* Preset Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => selectPreset(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activePresetIdx === idx
                    ? 'bg-white/15 border-white/20 text-white shadow-glow'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {preset.icon}
                <span>{preset.label}</span>
                <span className="text-[11px] text-white/40">{preset.minutes}m</span>
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activePresetIdx === -1
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <Timer size={16} />
              Custom
            </button>
          </div>

          {/* Custom Input */}
          <AnimatePresence>
            {showCustom && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setCustomMinutes((m) => Math.min(180, m + 5))}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <div className="w-20 text-center bg-white/5 border border-white/10 rounded-xl py-3 text-white text-2xl font-semibold tabular-nums">
                      {customMinutes}
                    </div>
                    <button
                      onClick={() => setCustomMinutes((m) => Math.max(1, m - 5))}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronDown size={20} />
                    </button>
                    <span className="text-[11px] text-white/40 uppercase tracking-widest mt-1">minutes</span>
                  </div>
                  <button
                    onClick={applyCustom}
                    className="clay-btn px-5 py-2.5 text-sm"
                  >
                    Set
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Circular Timer */}
          <div className="flex justify-center mb-10">
            <div className="relative w-56 h-56">
              {/* Glow */}
              <motion.div
                className={`absolute inset-[-20px] rounded-full bg-gradient-to-br ${activeColor} blur-[60px]`}
                animate={{ opacity: isRunning ? [0.08, 0.15, 0.08] : 0.05 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                {/* Track */}
                <circle
                  cx="100" cy="100" r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="5"
                />
                {/* Progress arc */}
                <motion.circle
                  cx="100" cy="100" r={radius}
                  fill="none"
                  stroke="url(#timerGradientFull)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {/* Tick dot at end of arc */}
                <defs>
                  <linearGradient id="timerGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={remainingSeconds}
                  initial={{ scale: 1.05, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-semibold text-white tracking-tight tabular-nums"
                >
                  {formatTime(remainingSeconds)}
                </motion.span>
                <span className="text-xs uppercase tracking-[0.2em] text-white/40 mt-2">
                  {isRunning ? 'Focusing...' : remainingSeconds === 0 ? '🎉 Done!' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <RotateCcw size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${activeColor} flex items-center justify-center text-white shadow-btn hover:shadow-btn-hover transition-all duration-300`}
            >
              {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </motion.button>

            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white font-semibold text-lg leading-none">{sessionsCompleted}</div>
                <div className="text-[9px] text-white/40 uppercase tracking-wider">done</div>
              </div>
            </div>
          </div>

          {/* Session Streak */}
          {sessionsCompleted > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                <Flame size={16} className="animate-pulse" />
                {sessionsCompleted} session{sessionsCompleted > 1 ? 's' : ''} completed today
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudyTimer;
