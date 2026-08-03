import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedWordItem } from "@/types/quiz";

const STORAGE_KEY = "onebite_saved_words";

interface SavedWordsState {
  items: SavedWordItem[];
  hydrated: boolean;
  isSaved: (id: string) => boolean;
  toggleSave: (item: SavedWordItem) => void;
  removeSaved: (id: string) => void;
  hydrate: () => Promise<void>;
}

async function persist(items: SavedWordItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const useSavedWordsStore = create<SavedWordsState>((set, get) => ({
  items: [],
  hydrated: false,

  isSaved: (id) => get().items.some((i) => i.id === id),

  toggleSave: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    const next = exists
      ? get().items.filter((i) => i.id !== item.id)
      : [item, ...get().items];
    set({ items: next });
    persist(next);
  },

  removeSaved: (id) => {
    const next = get().items.filter((i) => i.id !== id);
    set({ items: next });
    persist(next);
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
