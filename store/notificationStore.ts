import { Platform } from "react-native";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "onebite_notifications";
const REMINDER_IDENTIFIER = "onebite-daily-reminder";
const SUPPORTED = Platform.OS !== "web";

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

interface NotificationState {
  enabled: boolean;
  hour: number;
  minute: number;
  hydrated: boolean;
  supported: boolean;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  setTime: (hour: number, minute: number) => Promise<void>;
  hydrate: () => Promise<void>;
}

async function persist(state: { enabled: boolean; hour: number; minute: number }) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

async function scheduleReminder(hour: number, minute: number) {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: "오늘의 한입, 아직이에요",
      body: "잠깐 시간 내서 오늘의 일본어를 학습해볼까요?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  enabled: false,
  hour: 20,
  minute: 0,
  hydrated: false,
  supported: SUPPORTED,

  setEnabled: async (enabled) => {
    if (!SUPPORTED) return false;
    const { hour, minute } = get();
    if (enabled) {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let granted = existing === "granted";
      if (!granted) {
        const { status } = await Notifications.requestPermissionsAsync();
        granted = status === "granted";
      }
      if (!granted) return false;
      await scheduleReminder(hour, minute);
      set({ enabled: true });
      persist({ enabled: true, hour, minute });
      return true;
    }
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
    set({ enabled: false });
    persist({ enabled: false, hour, minute });
    return true;
  },

  setTime: async (hour, minute) => {
    if (!SUPPORTED) return;
    set({ hour, minute });
    persist({ enabled: get().enabled, hour, minute });
    if (get().enabled) {
      await scheduleReminder(hour, minute);
    }
  },

  hydrate: async () => {
    if (!SUPPORTED) {
      set({ hydrated: true });
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const saved = JSON.parse(raw);
      const hour = typeof saved.hour === "number" ? saved.hour : 20;
      const minute = typeof saved.minute === "number" ? saved.minute : 0;
      let enabled = !!saved.enabled;
      if (enabled) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          await scheduleReminder(hour, minute);
        } else {
          enabled = false;
          persist({ enabled: false, hour, minute });
        }
      }
      set({ enabled, hour, minute, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
