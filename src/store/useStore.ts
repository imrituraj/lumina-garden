import { create } from 'zustand';

export type GrowthLevel = 0 | 1 | 2 | 3; // Seed, Sprout, Sapling, Flowering
export type WeatherState = 'SUNNY' | 'RAINY' | 'CLOUDY' | 'THUNDER' | 'NIGHT';

export interface Subject {
  id: string;
  name: string;
  growthLevel: GrowthLevel;
  waterUnits: number; // 1 water unit = 10 correct answers (standard)
  correctAnswersProgress: number; // 0 to 10
  lastWatered: number; // timestamp
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
  
  // Environment Actions
  setWeather: (state: WeatherState, city: string) => void;
  setCityName: (city: string) => void;
  toggleMute: () => void;
  getWateringEfficiency: () => number;
}

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'ds', name: 'Data Structures', growthLevel: 0, waterUnits: 0, correctAnswersProgress: 0, lastWatered: Date.now(), isWilted: false },
  { id: 'apt', name: 'Aptitude', growthLevel: 1, waterUnits: 1, correctAnswersProgress: 0, lastWatered: Date.now() - (48 * 60 * 60 * 1000), isWilted: true },
  { id: 'os', name: 'Operating Systems', growthLevel: 2, waterUnits: 3, correctAnswersProgress: 0, lastWatered: Date.now(), isWilted: false },
];

export const useStore = create<AppState>((set, get) => ({
  totalXP: 0,
  subjects: INITIAL_SUBJECTS,
  activeQuizSubjectId: null,
  
  weatherState: 'SUNNY', // Default
  cityName: 'Unknown Location',
  isMuted: false,

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
    
    const updatedSubjects = state.subjects.map(subject => {
      if (subject.id === subjectId) {
        let newProgress = subject.correctAnswersProgress + progressGain;
        let newWater = subject.waterUnits;
        let newGrowth = subject.growthLevel;
        const now = Date.now();
        
        if (newProgress >= 10) {
          // If it overshoots, keep the remainder
          newProgress = newProgress - 10;
          newWater += 1;
          
          if (newWater >= 5) newGrowth = 3;
          else if (newWater >= 3) newGrowth = 2;
          else if (newWater >= 1) newGrowth = 1;
        }

        return {
          ...subject,
          correctAnswersProgress: newProgress,
          waterUnits: newWater,
          growthLevel: newGrowth,
          lastWatered: now,
          isWilted: false, 
        };
      }
      return subject;
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
