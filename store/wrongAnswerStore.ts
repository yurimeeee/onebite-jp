import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WrongAnswerItem } from "@/types/quiz";

const STORAGE_KEY = "onebite_wrong_answers";
// 오답노트에서 삭제(복습 완료)되어도 "역대 오답 횟수" 업적은 줄어들지 않아야 하므로
// items 개수와 별도로 누적 카운터를 둔다.
const TOTAL_EVER_KEY = "onebite_wrong_total_ever";

interface WrongAnswerState {
  items: WrongAnswerItem[];
  totalEverWrong: number;
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

async function persistTotalEver(total: number) {
  try {
    await AsyncStorage.setItem(TOTAL_EVER_KEY, JSON.stringify(total));
  } catch {}
}

export const useWrongAnswerStore = create<WrongAnswerState>((set, get) => ({
  items: [],
  totalEverWrong: 0,
  hydrated: false,

  addWrong: (item) => {
    const alreadyTracked = get().items.some((i) => i.id === item.id);
    const next = [item, ...get().items.filter((i) => i.id !== item.id)];
    if (alreadyTracked) {
      set({ items: next });
    } else {
      const totalEverWrong = get().totalEverWrong + 1;
      set({ items: next, totalEverWrong });
      persistTotalEver(totalEverWrong);
    }
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
      const [raw, rawTotal] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(TOTAL_EVER_KEY),
      ]);
      const saved = raw ? JSON.parse(raw) : null;
      const items: WrongAnswerItem[] = Array.isArray(saved) ? saved : [];
      const savedTotal = rawTotal ? JSON.parse(rawTotal) : null;
      // 기존 유저는 누적 카운터가 없으므로 현재 오답노트 개수를 최소값으로 삼는다.
      const totalEverWrong =
        typeof savedTotal === "number" ? Math.max(savedTotal, items.length) : items.length;
      set({ items, totalEverWrong, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
