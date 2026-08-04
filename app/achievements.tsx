import { useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { BADGES, CATEGORY_LABELS, type AchievementCategory, type Badge } from "@/constants/achievements";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { IconBadge } from "@/components/PillButton";
import { useAuthStore } from "@/store/authStore";
import { useAchievementStore } from "@/store/achievementStore";
import { computeAchievementStats } from "@/services/achievements";
import type { AchievementEvalStats } from "@/types/achievement";

const CATEGORY_ORDER: AchievementCategory[] = ["progress", "streak", "review", "collection"];

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")} 달성`;
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const unlocked = useAchievementStore((s) => s.unlocked);
  const bestStreak = useAchievementStore((s) => s.bestStreak);

  const [loading, setLoading] = useState(true);
  const [evalStats, setEvalStats] = useState<AchievementEvalStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.uid) {
          setEvalStats({
            completedDaysTotal: 0,
            levelCompletedDays: {},
            levelTotalDays: {},
            currentStreak: 0,
            accuracy: null,
            totalWrongEver: 0,
            savedWordsCount: 0,
            bestStreak,
          });
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const stats = await computeAchievementStats(user.uid);
          if (cancelled) return;
          setEvalStats({ ...stats, bestStreak: Math.max(bestStreak, stats.currentStreak) });
        } catch {
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.uid, bestStreak])
  );

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="업적" subtitle={`${unlockedCount} / ${BADGES.length} 달성`} />

      {loading || !evalStats ? (
        <View className="mt-16 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View className="mt-6 gap-6">
          {CATEGORY_ORDER.map((category) => (
            <View key={category}>
              <Text className="mb-3 text-sm font-bold text-primary">
                {CATEGORY_LABELS[category]}
              </Text>
              <View className="gap-3">
                {BADGES.filter((b) => b.category === category).map((badge) => (
                  <BadgeRow
                    key={badge.id}
                    badge={badge}
                    unlockedAt={unlocked[badge.id]}
                    stats={evalStats}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function BadgeRow({
  badge,
  unlockedAt,
  stats,
}: {
  badge: Badge;
  unlockedAt: number | undefined;
  stats: AchievementEvalStats;
}) {
  const isUnlocked = !!unlockedAt;
  const { current, target } = badge.progress(stats);
  const percent = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <View
      className="flex-row items-center gap-4 rounded-card p-4"
      style={{ backgroundColor: colors.surface, opacity: isUnlocked ? 1 : 0.85 }}
    >
      <IconBadge
        icon={badge.icon}
        bg={isUnlocked ? badge.color : colors.surface2}
        color={isUnlocked ? colors.textPrimary : colors.textSecondary}
        size={48}
      />
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="text-base font-bold"
            style={{ color: isUnlocked ? colors.textPrimary : colors.textSecondary }}
          >
            {badge.title}
          </Text>
          {isUnlocked ? (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          ) : null}
        </View>
        <Text className="mt-0.5 text-xs text-text-secondary">{badge.description}</Text>

        {isUnlocked ? (
          <Text className="mt-2 text-xs font-semibold" style={{ color: colors.success }}>
            {formatDate(unlockedAt!)}
          </Text>
        ) : (
          <View className="mt-2 flex-row items-center gap-2">
            <ProgressBar progress={percent} />
            <Text className="text-xs font-semibold text-text-secondary">
              {Math.min(current, target)}/{target}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
