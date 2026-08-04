import { create } from "zustand";
import { getUserProfile, setDailyGoal } from "@/services/profile";
import type { DailyGoalKey } from "@/constants/goals";

interface GoalState {
  dailyGoal: DailyGoalKey | null;
  /** Firestore에서 한 번이라도 조회를 마쳤는지 — 이걸 확인해야 "목표 없음"과 "아직 모름"을 구분할 수 있다. */
  known: boolean;
  hydrate: (uid: string) => Promise<void>;
  setGoal: (uid: string, goal: DailyGoalKey) => Promise<void>;
  reset: () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  dailyGoal: null,
  known: false,

  hydrate: async (uid) => {
    try {
      const profile = await getUserProfile(uid);
      set({ dailyGoal: profile.dailyGoal, known: true });
    } catch {
      set({ known: true });
    }
  },

  setGoal: async (uid, goal) => {
    await setDailyGoal(uid, goal);
    set({ dailyGoal: goal, known: true });
  },

  reset: () => set({ dailyGoal: null, known: false }),
}));
