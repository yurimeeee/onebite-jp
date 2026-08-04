import { Ionicons } from "@expo/vector-icons";
import { colors, levels, type LevelKey } from "@/constants/theme";
import type { AchievementEvalStats } from "@/types/achievement";

export type AchievementCategory = "progress" | "streak" | "review" | "collection";

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: "학습 진도",
  streak: "출석",
  review: "오답 정복",
  collection: "컬렉션",
};

export interface Badge {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  check: (s: AchievementEvalStats) => boolean;
  progress: (s: AchievementEvalStats) => { current: number; target: number };
}

function levelCompleted(s: AchievementEvalStats, level: LevelKey): boolean {
  const total = s.levelTotalDays[level] ?? 0;
  const done = s.levelCompletedDays[level] ?? 0;
  return total > 0 && done >= total;
}

function levelLabel(level: LevelKey): string {
  return levels.find((l) => l.key === level)?.label ?? level;
}

function levelProgress(s: AchievementEvalStats, level: LevelKey) {
  return {
    current: s.levelCompletedDays[level] ?? 0,
    target: Math.max(s.levelTotalDays[level] ?? 0, 1),
  };
}

export const BADGES: Badge[] = [
  {
    id: "first_step",
    category: "progress",
    title: "첫 발걸음",
    description: "Day 1을 완료했어요",
    icon: "footsteps",
    color: colors.pastelLime,
    check: (s) => s.completedDaysTotal >= 1,
    progress: (s) => ({ current: s.completedDaysTotal, target: 1 }),
  },
  {
    id: "days_10",
    category: "progress",
    title: "꾸준한 열흘",
    description: "Day 10개를 완료했어요",
    icon: "walk",
    color: colors.pastelCyan,
    check: (s) => s.completedDaysTotal >= 10,
    progress: (s) => ({ current: s.completedDaysTotal, target: 10 }),
  },
  {
    id: "days_50",
    category: "progress",
    title: "학습의 달인",
    description: "Day 50개를 완료했어요",
    icon: "school",
    color: colors.pastelAmber,
    check: (s) => s.completedDaysTotal >= 50,
    progress: (s) => ({ current: s.completedDaysTotal, target: 50 }),
  },
  {
    id: "days_100",
    category: "progress",
    title: "백일학습",
    description: "Day 100개를 완료했어요",
    icon: "trophy",
    color: colors.pastelPink,
    check: (s) => s.completedDaysTotal >= 100,
    progress: (s) => ({ current: s.completedDaysTotal, target: 100 }),
  },
  {
    id: "beginner_complete",
    category: "progress",
    title: `${levelLabel("beginner")} 과정 완강`,
    description: "입문(N5) 과정의 모든 Day를 완료했어요",
    icon: "leaf",
    color: colors.pastelLime,
    check: (s) => levelCompleted(s, "beginner"),
    progress: (s) => levelProgress(s, "beginner"),
  },
  {
    id: "elementary_complete",
    category: "progress",
    title: `${levelLabel("elementary")} 과정 완강`,
    description: "초급(N4) 과정의 모든 Day를 완료했어요",
    icon: "book",
    color: colors.pastelCyan,
    check: (s) => levelCompleted(s, "elementary"),
    progress: (s) => levelProgress(s, "elementary"),
  },
  {
    id: "intermediate_complete",
    category: "progress",
    title: `${levelLabel("intermediate")} 과정 완강`,
    description: "중급(N3) 과정의 모든 Day를 완료했어요",
    icon: "library",
    color: colors.pastelAmber,
    check: (s) => levelCompleted(s, "intermediate"),
    progress: (s) => levelProgress(s, "intermediate"),
  },
  {
    id: "advanced_complete",
    category: "progress",
    title: `${levelLabel("advanced")} 과정 마스터`,
    description: "고급(N2) 과정의 모든 Day를 완료했어요",
    icon: "ribbon",
    color: colors.pastelPink,
    check: (s) => levelCompleted(s, "advanced"),
    progress: (s) => levelProgress(s, "advanced"),
  },
  {
    id: "streak_3",
    category: "streak",
    title: "3일 연속 출석",
    description: "3일 연속으로 출석했어요",
    icon: "flame-outline",
    color: colors.pastelPeach,
    check: (s) => s.bestStreak >= 3,
    progress: (s) => ({ current: s.bestStreak, target: 3 }),
  },
  {
    id: "streak_7",
    category: "streak",
    title: "7일 연속 출석",
    description: "7일 연속으로 출석했어요",
    icon: "flame",
    color: colors.pastelPeach,
    check: (s) => s.bestStreak >= 7,
    progress: (s) => ({ current: s.bestStreak, target: 7 }),
  },
  {
    id: "streak_30",
    category: "streak",
    title: "30일 연속 출석",
    description: "30일 연속으로 출석했어요",
    icon: "bonfire",
    color: colors.pastelPeach,
    check: (s) => s.bestStreak >= 30,
    progress: (s) => ({ current: s.bestStreak, target: 30 }),
  },
  {
    id: "streak_100",
    category: "streak",
    title: "백일 개근",
    description: "100일 연속으로 출석했어요",
    icon: "sunny",
    color: colors.pastelPeach,
    check: (s) => s.bestStreak >= 100,
    progress: (s) => ({ current: s.bestStreak, target: 100 }),
  },
  {
    id: "wrong_10",
    category: "review",
    title: "오답 10개 기록",
    description: "오답노트에 10개를 기록했어요",
    icon: "alert-circle-outline",
    color: colors.dangerSoft,
    check: (s) => s.totalWrongEver >= 10,
    progress: (s) => ({ current: s.totalWrongEver, target: 10 }),
  },
  {
    id: "wrong_50",
    category: "review",
    title: "오답 50개 극복",
    description: "오답노트에 50개를 기록하며 극복했어요",
    icon: "shield-checkmark",
    color: colors.dangerSoft,
    check: (s) => s.totalWrongEver >= 50,
    progress: (s) => ({ current: s.totalWrongEver, target: 50 }),
  },
  {
    id: "accuracy_90",
    category: "review",
    title: "정답률 90% 달성",
    description: "누적 정답률 90% 이상을 달성했어요",
    icon: "stats-chart",
    color: colors.pastelLime,
    check: (s) => s.completedDaysTotal >= 5 && (s.accuracy ?? 0) >= 90,
    progress: (s) => ({ current: s.accuracy ?? 0, target: 90 }),
  },
  {
    id: "saved_20",
    category: "collection",
    title: "단어 수집가",
    description: "단어 20개를 저장했어요",
    icon: "bookmark",
    color: colors.pastelPink,
    check: (s) => s.savedWordsCount >= 20,
    progress: (s) => ({ current: s.savedWordsCount, target: 20 }),
  },
  {
    id: "saved_50",
    category: "collection",
    title: "단어 컬렉터",
    description: "단어 50개를 저장했어요",
    icon: "star",
    color: colors.pastelPink,
    check: (s) => s.savedWordsCount >= 50,
    progress: (s) => ({ current: s.savedWordsCount, target: 50 }),
  },
];
