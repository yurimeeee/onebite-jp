import { Platform } from "react-native";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "onebite_notifications";
const REMINDER_IDENTIFIER = "onebite-daily-reminder";
const STREAK_WARNING_IDENTIFIER = "onebite-streak-warning";
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

interface PersistedState {
  enabled: boolean;
  hour: number;
  minute: number;
  streakWarningEnabled: boolean;
  streakWarningHour: number;
  streakWarningMinute: number;
}

interface NotificationState extends PersistedState {
  hydrated: boolean;
  supported: boolean;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  setTime: (hour: number, minute: number) => Promise<void>;
  setStreakWarningEnabled: (enabled: boolean) => Promise<boolean>;
  setStreakWarningTime: (hour: number, minute: number) => Promise<void>;
  syncStreakWarningForToday: (checkedInToday: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
}

async function persist(state: PersistedState) {
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

async function cancelStreakWarning() {
  await Notifications.cancelScheduledNotificationAsync(STREAK_WARNING_IDENTIFIER).catch(() => {});
}

/** 오늘 지정 시각이 아직 지나지 않은 경우에만 1회성 알림을 예약한다.
 * (반복 트리거는 "오늘 출석했는지"를 알 수 없어 매번 껐다 켜야 하므로,
 * 앱을 열 때/출석 체크할 때마다 오늘자 알림을 다시 계산해서 심는다.) */
async function scheduleStreakWarningForToday(hour: number, minute: number) {
  await cancelStreakWarning();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_WARNING_IDENTIFIER,
    content: {
      title: "스트릭이 끊기기 직전이에요",
      body: "오늘 아직 출석 체크를 안 하셨어요. 지금 학습하고 스트릭을 이어가세요!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  enabled: false,
  hour: 20,
  minute: 0,
  streakWarningEnabled: false,
  streakWarningHour: 21,
  streakWarningMinute: 0,
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
      persist({ ...get(), enabled: true });
      return true;
    }
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
    set({ enabled: false });
    persist({ ...get(), enabled: false });
    return true;
  },

  setTime: async (hour, minute) => {
    if (!SUPPORTED) return;
    set({ hour, minute });
    persist({ ...get(), hour, minute });
    if (get().enabled) {
      await scheduleReminder(hour, minute);
    }
  },

  setStreakWarningEnabled: async (enabled) => {
    if (!SUPPORTED) return false;
    if (enabled) {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let granted = existing === "granted";
      if (!granted) {
        const { status } = await Notifications.requestPermissionsAsync();
        granted = status === "granted";
      }
      if (!granted) return false;
      set({ streakWarningEnabled: true });
      persist({ ...get(), streakWarningEnabled: true });
      // 오늘자 예약 여부는 출석 상태를 아는 호출부(앱 실행/출석 체크)에서
      // syncStreakWarningForToday로 결정한다.
      return true;
    }
    await cancelStreakWarning();
    set({ streakWarningEnabled: false });
    persist({ ...get(), streakWarningEnabled: false });
    return true;
  },

  setStreakWarningTime: async (hour, minute) => {
    if (!SUPPORTED) return;
    set({ streakWarningHour: hour, streakWarningMinute: minute });
    persist({ ...get(), streakWarningHour: hour, streakWarningMinute: minute });
  },

  syncStreakWarningForToday: async (checkedInToday) => {
    if (!SUPPORTED) return;
    const { streakWarningEnabled, streakWarningHour, streakWarningMinute } = get();
    if (!streakWarningEnabled) return;
    if (checkedInToday) {
      await cancelStreakWarning();
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;
    await scheduleStreakWarningForToday(streakWarningHour, streakWarningMinute);
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
      const streakWarningHour =
        typeof saved.streakWarningHour === "number" ? saved.streakWarningHour : 21;
      const streakWarningMinute =
        typeof saved.streakWarningMinute === "number" ? saved.streakWarningMinute : 0;
      let enabled = !!saved.enabled;
      let streakWarningEnabled = !!saved.streakWarningEnabled;

      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === "granted";
      if (enabled && granted) {
        await scheduleReminder(hour, minute);
      } else if (enabled && !granted) {
        enabled = false;
      }
      if (streakWarningEnabled && !granted) {
        streakWarningEnabled = false;
      }
      if (enabled !== !!saved.enabled || streakWarningEnabled !== !!saved.streakWarningEnabled) {
        persist({
          enabled,
          hour,
          minute,
          streakWarningEnabled,
          streakWarningHour,
          streakWarningMinute,
        });
      }
      set({
        enabled,
        hour,
        minute,
        streakWarningEnabled,
        streakWarningHour,
        streakWarningMinute,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));
