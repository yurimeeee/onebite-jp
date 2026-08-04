import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BADGES, type Badge } from "@/constants/achievements";
import type { AchievementStats } from "@/types/achievement";

const STORAGE_KEY = "onebite_achievements";

interface StoredShape {
  unlocked: Record<string, number>;
  bestStreak: number;
}

interface AchievementState {
  unlocked: Record<string, number>;
  bestStreak: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  evaluate: (stats: AchievementStats) => Badge[];
}

async function persist(unlocked: Record<string, number>, bestStreak: number) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlocked, bestStreak } satisfies StoredShape)
    );
  } catch {}
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  unlocked: {},
  bestStreak: 0,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<StoredShape>) : null;
      set({
        unlocked:
          saved?.unlocked && typeof saved.unlocked === "object" ? saved.unlocked : {},
        bestStreak: typeof saved?.bestStreak === "number" ? saved.bestStreak : 0,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  evaluate: (stats) => {
    const { unlocked, bestStreak } = get();
    const nextBestStreak = Math.max(bestStreak, stats.currentStreak);
    const fullStats = { ...stats, bestStreak: nextBestStreak };

    const newlyUnlocked: Badge[] = [];
    const nextUnlocked = { ...unlocked };
    for (const badge of BADGES) {
      if (nextUnlocked[badge.id]) continue;
      if (badge.check(fullStats)) {
        nextUnlocked[badge.id] = Date.now();
        newlyUnlocked.push(badge);
      }
    }

    if (newlyUnlocked.length > 0 || nextBestStreak !== bestStreak) {
      set({ unlocked: nextUnlocked, bestStreak: nextBestStreak });
      persist(nextUnlocked, nextBestStreak);
    }

    return newlyUnlocked;
  },
}));
