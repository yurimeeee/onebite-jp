import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onebite_settings";

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  hydrate: () => Promise<void>;
}

async function persist(state: { soundEnabled: boolean; vibrationEnabled: boolean }) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  vibrationEnabled: true,

  toggleSound: () => {
    const next = { ...get(), soundEnabled: !get().soundEnabled };
    set(next);
    persist({ soundEnabled: next.soundEnabled, vibrationEnabled: next.vibrationEnabled });
  },

  toggleVibration: () => {
    const next = { ...get(), vibrationEnabled: !get().vibrationEnabled };
    set(next);
    persist({ soundEnabled: next.soundEnabled, vibrationEnabled: next.vibrationEnabled });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          soundEnabled: saved.soundEnabled ?? true,
          vibrationEnabled: saved.vibrationEnabled ?? true,
        });
      }
    } catch {}
  },
}));
