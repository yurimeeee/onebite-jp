import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WrongAnswerItem } from "@/types/quiz";

const STORAGE_KEY = "onebite_wrong_answers";

interface WrongAnswerState {
  items: WrongAnswerItem[];
  hydrated: boolean;
  addWrong: (item: WrongAnswerItem) => void;
  removeWrong: (id: string) => void;
  clearAll: () => void;
  hydrate: () => Promise<void>;
}

async function persist(items: WrongAnswerItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const useWrongAnswerStore = create<WrongAnswerState>((set, get) => ({
  items: [],
  hydrated: false,

  addWrong: (item) => {
    const next = [item, ...get().items.filter((i) => i.id !== item.id)];
    set({ items: next });
    persist(next);
  },

  removeWrong: (id) => {
    const next = get().items.filter((i) => i.id !== id);
    set({ items: next });
    persist(next);
  },

  clearAll: () => {
    set({ items: [] });
    persist([]);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      set({ items: Array.isArray(saved) ? saved : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
