import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onebite_settings";

export const SPEECH_RATES = [0.8, 1.0, 1.2] as const;
export type SpeechRate = (typeof SPEECH_RATES)[number];

interface PersistedSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  furiganaEnabled: boolean;
  speechRate: SpeechRate;
}

interface SettingsState extends PersistedSettings {
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleFurigana: () => void;
  setSpeechRate: (rate: SpeechRate) => void;
  hydrate: () => Promise<void>;
}

async function persist(state: PersistedSettings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function persistedSlice(state: SettingsState): PersistedSettings {
  return {
    soundEnabled: state.soundEnabled,
    vibrationEnabled: state.vibrationEnabled,
    furiganaEnabled: state.furiganaEnabled,
    speechRate: state.speechRate,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  vibrationEnabled: true,
  furiganaEnabled: true,
  speechRate: 1.0,

  toggleSound: () => {
    const next = { ...get(), soundEnabled: !get().soundEnabled };
    set(next);
    persist(persistedSlice(next));
  },

  toggleVibration: () => {
    const next = { ...get(), vibrationEnabled: !get().vibrationEnabled };
    set(next);
    persist(persistedSlice(next));
  },

  toggleFurigana: () => {
    const next = { ...get(), furiganaEnabled: !get().furiganaEnabled };
    set(next);
    persist(persistedSlice(next));
  },

  setSpeechRate: (rate) => {
    const next = { ...get(), speechRate: rate };
    set(next);
    persist(persistedSlice(next));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          soundEnabled: saved.soundEnabled ?? true,
          vibrationEnabled: saved.vibrationEnabled ?? true,
          furiganaEnabled: saved.furiganaEnabled ?? true,
          speechRate: SPEECH_RATES.includes(saved.speechRate) ? saved.speechRate : 1.0,
        });
      }
    } catch {}
  },
}));
