import type { LevelKey } from "@/constants/theme";

export interface AchievementStats {
  completedDaysTotal: number;
  levelCompletedDays: Partial<Record<LevelKey, number>>;
  levelTotalDays: Partial<Record<LevelKey, number>>;
  currentStreak: number;
  accuracy: number | null;
  totalWrongEver: number;
  savedWordsCount: number;
}

export interface AchievementEvalStats extends AchievementStats {
  bestStreak: number;
}
