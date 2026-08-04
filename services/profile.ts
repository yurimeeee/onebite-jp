import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/services/firebase";
import { getCached, invalidateCache } from "@/utils/cache";
import type { DailyGoalKey } from "@/constants/goals";

const PROFILE_TTL = 60 * 1000;

export type UserProfile = {
  nickname: string | null;
  weeklyXP: number;
  weeklyXPWeekKey: string | null;
  dailyGoal: DailyGoalKey | null;
};

const EMPTY_PROFILE: UserProfile = {
  nickname: null,
  weeklyXP: 0,
  weeklyXPWeekKey: null,
  dailyGoal: null,
};

const VALID_GOAL_KEYS: DailyGoalKey[] = ["light", "standard", "hardcore"];

export async function getUserProfile(uid: string): Promise<UserProfile> {
  return getCached(
    `profile:${uid}`,
    async () => {
      const snapshot = await getDoc(doc(db, "users", uid));
      if (!snapshot.exists()) return EMPTY_PROFILE;
      const data = snapshot.data();
      return {
        nickname: typeof data.nickname === "string" ? data.nickname : null,
        weeklyXP: typeof data.weeklyXP === "number" ? data.weeklyXP : 0,
        weeklyXPWeekKey: typeof data.weeklyXPWeekKey === "string" ? data.weeklyXPWeekKey : null,
        dailyGoal: VALID_GOAL_KEYS.includes(data.dailyGoal) ? data.dailyGoal : null,
      };
    },
    PROFILE_TTL
  );
}

export async function setNickname(uid: string, nickname: string): Promise<void> {
  await setDoc(doc(db, "users", uid), { nickname }, { merge: true });
  invalidateCache(`profile:${uid}`);
}

export async function setDailyGoal(uid: string, dailyGoal: DailyGoalKey): Promise<void> {
  await setDoc(doc(db, "users", uid), { dailyGoal }, { merge: true });
  invalidateCache(`profile:${uid}`);
}
