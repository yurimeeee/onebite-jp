import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, levels } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";
import {
  calcStreak,
  getAttendance,
  getLastStudy,
  getUserHistoryMap,
} from "@/services/quiz";
import type { UserLastStudyInfo } from "@/types/user";

function formatRelative(timestamp: { seconds: number } | null | undefined) {
  if (!timestamp) return "학습 기록 없음";
  const date = new Date(timestamp.seconds * 1000);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default function MyPageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const wrongCount = useWrongAnswerStore((s) => s.items.length);
  const savedCount = useSavedWordsStore((s) => s.items.length);

  const [loading, setLoading] = useState(true);
  const [lastStudy, setLastStudy] = useState<UserLastStudyInfo | null>(null);
  const [completedDays, setCompletedDays] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.uid) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const [history, last, attendance] = await Promise.all([
            getUserHistoryMap(user.uid),
            getLastStudy(user.uid),
            getAttendance(user.uid),
          ]);
          if (cancelled) return;
          const entries = Object.values(history).filter((h) => h.completed);
          setCompletedDays(entries.length);
          const scored = entries.filter(
            (h) => typeof h.correct === "number" && typeof h.total === "number" && h.total! > 0
          );
          if (scored.length > 0) {
            const sumCorrect = scored.reduce((s, h) => s + (h.correct ?? 0), 0);
            const sumTotal = scored.reduce((s, h) => s + (h.total ?? 0), 0);
            setAccuracy(Math.round((sumCorrect / sumTotal) * 100));
          } else {
            setAccuracy(null);
          }
          setLastStudy(last);
          setStreak(calcStreak(attendance, new Date()));
        } catch {
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.uid])
  );

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "학습자";
  const levelInfo = levels.find((l) => l.key === lastStudy?.last_study_level);
  const levelLabel = levelInfo ? `${levelInfo.label} (JLPT ${levelInfo.jlpt})` : undefined;

  const menu: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    href?: "/settings" | "/notifications" | "/quiz/review" | "/quiz/saved";
    badge?: number;
  }[] = [
    { icon: "repeat-outline", label: "오답노트", href: "/quiz/review", badge: wrongCount },
    { icon: "notifications-outline", label: "알림 설정", href: "/notifications" },
    { icon: "bookmark-outline", label: "저장한 단어", href: "/quiz/saved", badge: savedCount },
    { icon: "help-circle-outline", label: "도움말" },
    { icon: "settings-outline", label: "환경 설정", href: "/settings" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 프로필 헤더 */}
      <View className="flex-row items-center gap-4">
        <View
          className="h-16 w-16 items-center justify-center rounded-pill"
          style={{ backgroundColor: colors.pastelPinkLight }}
        >
          <Text className="text-2xl font-bold text-text-primary">
            {displayName[0]?.toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text-primary">{displayName}님</Text>
          <Text className="mt-0.5 text-text-secondary" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="mt-6 items-center py-6">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          {/* 최근 학습 */}
          <View className="mt-6 rounded-card bg-surface p-5">
            <Text className="text-sm font-bold text-primary">최근 학습</Text>
            {lastStudy ? (
              <View className="mt-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-secondary">레벨</Text>
                  <Text className="font-semibold text-text-primary">{levelLabel}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-secondary">진행</Text>
                  <Text className="font-semibold text-text-primary">
                    Day {lastStudy.last_study_day}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-secondary">마지막 학습</Text>
                  <Text className="font-semibold text-text-primary">
                    {formatRelative(lastStudy.last_updated as any)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="mt-3 text-text-secondary">아직 학습 기록이 없습니다</Text>
            )}
          </View>

          {/* 통계 카드 */}
          <View className="mt-4 flex-row gap-3">
            <StatCard
              value={`${completedDays}`}
              label="완료 Day"
              icon="book"
              bg={colors.pastelCyanLight}
            />
            <StatCard
              value={`${streak}일`}
              label="연속 출석"
              icon="flame"
              bg={colors.pastelPeachLight}
            />
            <StatCard
              value={accuracy != null ? `${accuracy}%` : "-"}
              label="정답률"
              icon="stats-chart"
              bg={colors.pastelLimeLight}
            />
          </View>
        </>
      )}

      {/* 메뉴 */}
      <View className="mt-6 overflow-hidden rounded-card bg-surface">
        {menu.map((m, i) => (
          <Pressable
            key={m.label}
            onPress={m.href ? () => router.push(m.href!) : undefined}
            className="flex-row items-center gap-3 px-5 py-4 active:opacity-70"
            style={{
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <Ionicons name={m.icon} size={22} color={colors.textPrimary} />
            <Text className="flex-1 text-base font-semibold text-text-primary">
              {m.label}
            </Text>
            {m.badge ? (
              <View
                className="mr-1 items-center justify-center rounded-pill px-2 py-0.5"
                style={{ backgroundColor: colors.dangerSoft, minWidth: 22 }}
              >
                <Text className="text-xs font-bold" style={{ color: colors.danger }}>
                  {m.badge}
                </Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      {/* 로그아웃 */}
      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/");
        }}
        className="mt-6 flex-row items-center justify-center gap-2 rounded-pill border-2 border-border bg-surface py-4 active:scale-[0.98]"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text className="text-base font-bold" style={{ color: colors.danger }}>
          로그아웃
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({
  value,
  label,
  icon,
  bg,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}) {
  return (
    <View className="flex-1 items-center rounded-card py-5" style={{ backgroundColor: bg }}>
      <Ionicons name={icon} size={22} color={colors.textPrimary} />
      <Text className="mt-2 text-xl font-bold text-text-primary">{value}</Text>
      <Text className="mt-0.5 text-xs text-text-secondary">{label}</Text>
    </View>
  );
}
