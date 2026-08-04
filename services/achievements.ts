import { levels, type LevelKey } from "@/constants/theme";
import type { Badge } from "@/constants/achievements";
import {
  calcStreak,
  getAttendance,
  getDaysForLevel,
  getUserHistoryMap,
} from "@/services/quiz";
import { useAchievementStore } from "@/store/achievementStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import type { AchievementStats } from "@/types/achievement";

export async function computeAchievementStats(uid: string): Promise<AchievementStats> {
  const [historyMap, attendance, dayLists] = await Promise.all([
    getUserHistoryMap(uid),
    getAttendance(uid),
    Promise.all(levels.map((l) => getDaysForLevel(l.key))),
  ]);

  const entries = Object.entries(historyMap);
  const completedEntries = entries.filter(([, h]) => h.completed);
  const completedDaysTotal = completedEntries.length;

  const levelCompletedDays: Partial<Record<LevelKey, number>> = {};
  const levelTotalDays: Partial<Record<LevelKey, number>> = {};
  levels.forEach((l, i) => {
    levelTotalDays[l.key] = dayLists[i].length;
    levelCompletedDays[l.key] = completedEntries.filter(([key]) =>
      key.startsWith(`${l.key}_day`)
    ).length;
  });

  const scored = completedEntries
    .map(([, h]) => h)
    .filter(
      (h) => typeof h.correct === "number" && typeof h.total === "number" && h.total! > 0
    );
  const accuracy =
    scored.length > 0
      ? Math.round(
          (scored.reduce((s, h) => s + (h.correct ?? 0), 0) /
            scored.reduce((s, h) => s + (h.total ?? 0), 0)) *
            100
        )
      : null;

  return {
    completedDaysTotal,
    levelCompletedDays,
    levelTotalDays,
    currentStreak: calcStreak(attendance, new Date()),
    accuracy,
    totalWrongEver: useWrongAnswerStore.getState().totalEverWrong,
    savedWordsCount: useSavedWordsStore.getState().items.length,
  };
}

/** 최신 학습 통계를 계산해 새로 달성한 업적을 잠금 해제한다 (이미 해제된 업적은 다시 반환하지 않는다). */
export async function checkAchievements(uid: string | undefined): Promise<Badge[]> {
  if (!uid) return [];
  try {
    const stats = await computeAchievementStats(uid);
    return useAchievementStore.getState().evaluate(stats);
  } catch {
    return [];
  }
}
