import { colors } from "@/constants/theme";

export type DailyGoalKey = "light" | "standard" | "hardcore";

export interface DailyGoalOption {
  key: DailyGoalKey;
  emoji: string;
  minutes: number;
  tier: string;
  title: string;
  subtitle: string;
  color: string;
  recommended?: boolean;
}

export const DAILY_GOALS: DailyGoalOption[] = [
  {
    key: "light",
    emoji: "🌱",
    minutes: 3,
    tier: "라이트",
    title: "하루 3분",
    subtitle: "출퇴근길 부담 없이 딱 한 판!",
    color: colors.pastelLimeLight,
    recommended: true,
  },
  {
    key: "standard",
    emoji: "🌿",
    minutes: 5,
    tier: "스탠다드",
    title: "하루 5분",
    subtitle: "단어 10개 완벽하게 내 것으로",
    color: colors.pastelCyanLight,
  },
  {
    key: "hardcore",
    emoji: "🌳",
    minutes: 10,
    tier: "하드코어",
    title: "하루 10분",
    subtitle: "JLPT 시험까지 빠른 합격 코스",
    color: colors.pastelAmberLight,
  },
];
