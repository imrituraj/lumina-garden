import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, SUBJECT_CONNECTIONS } from '../../store/useStore';

interface Coordinates {
  x: number;
  y: number;
}

const RootNetwork: React.FC = () => {
  const { subjects, isRootViewActive } = useStore();
  const [coordinates, setCoordinates] = useState<Record<string, Coordinates>>({});
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const updateCoordinates = useCallback(() => {
    if (!isRootViewActive) return;
    
    const newCoords: Record<string, Coordinates> = {};
    subjects.forEach((subject) => {
      const el = document.querySelector(`[data-subject-id="${subject.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[subject.id] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    });
    setCoordinates(newCoords);
  }, [subjects, isRootViewActive]);

  useEffect(() => {
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    return () => window.removeEventListener('resize', updateCoordinates);
  }, [updateCoordinates]);

  // Recalculate if DOM shifts initially
  useEffect(() => {
    if (isRootViewActive) {
      const timer = setTimeout(updateCoordinates, 100);
      return () => clearTimeout(timer);
    }
  }, [isRootViewActive, updateCoordinates]);

  if (!isRootViewActive) return null;

  return (
    <>
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.4))' }}
      >
        {SUBJECT_CONNECTIONS.map((conn) => {
          const sourceNode = subjects.find(s => s.id === conn.source);
          const targetNode = subjects.find(s => s.id === conn.target);
          const sourceCoord = coordinates[conn.source];
          const targetCoord = coordinates[conn.target];

          if (!sourceNode || !targetNode || !sourceCoord || !targetCoord) return null;

          const now = Date.now();
          const isSourceAlive = now - sourceNode.lastActive <= 48 * 60 * 60 * 1000;
          const isTargetAlive = now - targetNode.lastActive <= 48 * 60 * 60 * 1000;
          
          const isWilting = sourceNode.isWilted || targetNode.isWilted;
          const isAlive = isSourceAlive && isTargetAlive && !isWilting;

          const edgeId = `${conn.source}-${conn.target}`;

          // Cubic Bezier to make it look organic
          const midX = (sourceCoord.x + targetCoord.x) / 2;
          const d = `M ${sourceCoord.x} ${sourceCoord.y} C ${midX} ${sourceCoord.y}, ${midX} ${targetCoord.y}, ${targetCoord.x} ${targetCoord.y}`;

          return (
            <g key={edgeId}>
              {/* Invisible wide path for hover detection */}
              <path
                d={d}
                stroke="transparent"
                strokeWidth={30}
                fill="none"
                className="pointer-events-auto cursor-pointer"
                onMouseEnter={(e) => {
                  setHoveredEdge(edgeId);
                  setMousePos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  setMousePos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredEdge(null)}
              />

              {/* Base Path */}
              <motion.path
                d={d}
                stroke={isAlive ? '#4ade80' : '#64748b'}
                strokeWidth={isAlive ? 4 : 2}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={isAlive ? 'opacity-80' : 'opacity-40'}
              />

              {/* Energy Pulse (Orb moving along the path) */}
              {isAlive && (
                <motion.path
                  d={d}
                  stroke="#ffffff"
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="1 1000"
                  animate={{ strokeDashoffset: [1000, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: Math.random() * 2 // Randomize pulse times
                  }}
                  style={{ filter: 'drop-shadow(0 0 12px #fff)' }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Glassmorphic Tooltip */}
      <AnimatePresence>
        {hoveredEdge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
          >
            <div className="glass-panel p-4 rounded-xl text-sm text-white max-w-[280px] shadow-glow backdrop-blur-md border border-white/20">
              <span className="font-semibold text-teal-300 block mb-1">Deep Knowledge Synergy</span>
              <p className="text-white/80 leading-relaxed">
                Mastering these connected subjects nourishes the network! Studying either one grants a <span className="text-emerald-400 font-bold">+20%</span> growth multiplier to the other.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RootNetwork;
