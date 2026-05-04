import { create } from 'zustand';

export type GrowthLevel = 0 | 1 | 2 | 3; // Seed, Sprout, Sapling, Flowering
export type WeatherState = 'SUNNY' | 'RAINY' | 'CLOUDY' | 'THUNDER' | 'NIGHT';

export interface SubjectMastery {
  subjectId: string;
  accuracy: number; // 0 to 100
  questionsAnswered: number;
  correctAnswers: number;
  conceptsDiscovered: string[];
  conceptsMissed: string[];
}

export interface Subject {
  id: string;
  name: string;
  growthLevel: GrowthLevel;
  waterUnits: number; // 1 water unit = 10 correct answers (standard)
  correctAnswersProgress: number; // 0 to 10
  lastWatered: number; // timestamp
  lastActive: number; // timestamp
  isWilted: boolean;
}

interface AppState {
  totalXP: number;
  subjects: Subject[];
  activeQuizSubjectId: string | null;
  
  // Weather & Environment
  weatherState: WeatherState;
  cityName: string;
  isMuted: boolean;
  
  // Actions
  addXP: (amount: number) => void;
  startQuiz: (subjectId: string) => void;
  endQuiz: () => void;
  recordCorrectAnswer: (subjectId: string) => void;
  checkWiltStatus: () => void;
  
  // Phase 2: Pollen & Global Forest
  globalForestHealth: number;
  goldenHourActive: boolean;
  pollenReleaseTrigger: number;
  consecutiveCorrectAnswers: number;
  incrementGlobalForestHealth: (amount: number) => void;
  triggerGoldenHour: () => void;
  releasePollen: () => void;
  resetStreak: () => void;
  
  // Phase 3: Almanac & Mastery
  isAlmanacOpen: boolean;
  masteryLog: Record<string, SubjectMastery>;
  toggleAlmanac: () => void;
  recordQuizCompletion: (subjectId: string, stats: { accuracy: number, conceptsDiscovered: string[], conceptsMissed: string[], total: number, correct: number }) => void;

  // Phase 4: Root Network
  isRootViewActive: boolean;
  toggleRootView: () => void;

  // Environment Actions
  setWeather: (state: WeatherState, city: string) => void;
  setCityName: (city: string) => void;
  toggleMute: () => void;
  getWateringEfficiency: () => number;
}

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'ds', name: 'Data Structures', growthLevel: 0, waterUnits: 0, correctAnswersProgress: 0, lastWatered: Date.now(), lastActive: Date.now(), isWilted: false },
  { id: 'apt', name: 'Aptitude', growthLevel: 1, waterUnits: 1, correctAnswersProgress: 0, lastWatered: Date.now() - (48 * 60 * 60 * 1000), lastActive: Date.now() - (48 * 60 * 60 * 1000), isWilted: true },
  { id: 'os', name: 'Operating Systems', growthLevel: 2, waterUnits: 3, correctAnswersProgress: 0, lastWatered: Date.now(), lastActive: Date.now(), isWilted: false },
];

export const SUBJECT_CONNECTIONS = [
  { source: 'ds', target: 'os' },
  { source: 'apt', target: 'ds' },
];

export const useStore = create<AppState>((set, get) => ({
  totalXP: 0,
  subjects: INITIAL_SUBJECTS,
  activeQuizSubjectId: null,
  
  weatherState: 'SUNNY', // Default
  cityName: 'Unknown Location',
  isMuted: false,

  isRootViewActive: false,
  toggleRootView: () => set(state => ({ isRootViewActive: !state.isRootViewActive })),

  isAlmanacOpen: false,
  masteryLog: {},

  toggleAlmanac: () => set(state => ({ isAlmanacOpen: !state.isAlmanacOpen })),
  
  recordQuizCompletion: (subjectId, stats) => set(state => {
    const existing = state.masteryLog[subjectId];
    
    // Merge concepts (unique)
    const newDiscovered = Array.from(new Set([...(existing?.conceptsDiscovered || []), ...stats.conceptsDiscovered]));
    
    // Only keep missed concepts if they haven't been discovered
    const existingMissed = existing?.conceptsMissed || [];
    const updatedMissed = Array.from(new Set([...existingMissed, ...stats.conceptsMissed]))
      .filter(concept => !newDiscovered.includes(concept));

    const newTotal = (existing?.questionsAnswered || 0) + stats.total;
    const newCorrect = (existing?.correctAnswers || 0) + stats.correct;
    const newAccuracy = (newCorrect / newTotal) * 100;

    return {
      masteryLog: {
        ...state.masteryLog,
        [subjectId]: {
          subjectId,
          accuracy: newAccuracy,
          questionsAnswered: newTotal,
          correctAnswers: newCorrect,
          conceptsDiscovered: newDiscovered,
          conceptsMissed: updatedMissed,
        }
      }
    };
  }),

  globalForestHealth: 15,
  goldenHourActive: false,
  pollenReleaseTrigger: 0,
  consecutiveCorrectAnswers: 0,

  incrementGlobalForestHealth: (amount) => set((state) => {
    let newHealth = state.globalForestHealth + amount;
    if (newHealth >= 100 && !state.goldenHourActive) {
      get().triggerGoldenHour();
      newHealth = 100;
    }
    return { globalForestHealth: newHealth };
  }),

  triggerGoldenHour: () => {
    set({ goldenHourActive: true });
    // 10 minutes buff
    setTimeout(() => {
      set({ goldenHourActive: false, globalForestHealth: 0 });
    }, 10 * 60 * 1000);
  },

  releasePollen: () => set((state) => ({ pollenReleaseTrigger: state.pollenReleaseTrigger + 1 })),
  
  resetStreak: () => set({ consecutiveCorrectAnswers: 0 }),

  addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
  
  startQuiz: (subjectId) => set({ activeQuizSubjectId: subjectId }),
  
  endQuiz: () => set({ activeQuizSubjectId: null }),
  
  setWeather: (weatherState, cityName) => set({ weatherState, cityName }),
  setCityName: (cityName) => set({ cityName }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  
  getWateringEfficiency: () => {
    return get().weatherState === 'RAINY' ? 2.0 : 1.0;
  },
  
  recordCorrectAnswer: (subjectId) => set((state) => {
    let efficiency = get().getWateringEfficiency();
    if (state.goldenHourActive) {
      efficiency *= 2; // Golden hour double growth
    }

    const progressGain = 1 * efficiency;
    const newStreak = state.consecutiveCorrectAnswers + 1;
    const shouldReleasePollen = newStreak > 0 && newStreak % 5 === 0;
    const now = Date.now();
    const aliveNeighbors = new Set<string>();
    
    SUBJECT_CONNECTIONS.forEach(conn => {
      if (conn.source === subjectId || conn.target === subjectId) {
        const neighborId = conn.source === subjectId ? conn.target : conn.source;
        const neighbor = state.subjects.find(s => s.id === neighborId);
        if (neighbor && (now - neighbor.lastActive <= 48 * 60 * 60 * 1000)) {
          aliveNeighbors.add(neighborId);
        }
      }
    });
    
    const updatedSubjects = state.subjects.map(subject => {
      let newProgress = subject.correctAnswersProgress;
      let newWater = subject.waterUnits;
      let newGrowth = subject.growthLevel;
      let newLastWatered = subject.lastWatered;
      let newLastActive = subject.lastActive;
      let newIsWilted = subject.isWilted;

      if (subject.id === subjectId) {
        newProgress += progressGain;
        newLastWatered = now;
        newLastActive = now;
        newIsWilted = false;
      } else if (aliveNeighbors.has(subject.id)) {
        // Synergy buff: neighbors gain 20% of the progress multiplier
        newProgress += progressGain * 0.2;
      }

      if (newProgress !== subject.correctAnswersProgress) {
        if (newProgress >= 10) {
          // If it overshoots, keep the remainder
          newProgress = newProgress - 10;
          newWater += 1;
          
          if (newWater >= 5) newGrowth = 3;
          else if (newWater >= 3) newGrowth = 2;
          else if (newWater >= 1) newGrowth = 1;
        }
      }

      return {
        ...subject,
        correctAnswersProgress: newProgress,
        waterUnits: newWater,
        growthLevel: newGrowth,
        lastWatered: newLastWatered,
        lastActive: newLastActive,
        isWilted: newIsWilted,
      };
    });

    return { 
      subjects: updatedSubjects,
      totalXP: state.totalXP + 10,
      consecutiveCorrectAnswers: newStreak,
      pollenReleaseTrigger: shouldReleasePollen ? state.pollenReleaseTrigger + 1 : state.pollenReleaseTrigger
    };
  }),

  checkWiltStatus: () => set((state) => {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    const updatedSubjects = state.subjects.map(subject => {
      const timeSinceWatered = now - subject.lastWatered;
      if (timeSinceWatered > ONE_DAY_MS && !subject.isWilted) {
        return { ...subject, isWilted: true };
      }
      return subject;
    });

    return { subjects: updatedSubjects };
  })
}));
