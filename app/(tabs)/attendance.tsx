import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import {
  calcStreak,
  checkInToday,
  formatDateKey,
  getAttendance,
} from "@/services/quiz";
import { checkAchievements } from "@/services/achievements";
import { BadgeUnlockOverlay } from "@/components/BadgeUnlockOverlay";
import { PillButton } from "@/components/PillButton";
import { ShareCardModal } from "@/components/ShareCardModal";
import type { Badge } from "@/constants/achievements";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: { date: Date; inMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: new Date(year, month, i), inMonth: true });
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }
  }
  return days;
}

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const today = new Date();
  const todayKey = formatDateKey(today);

  const [attended, setAttended] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [shareVisible, setShareVisible] = useState(false);

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
          const dates = await getAttendance(user.uid);
          if (!cancelled) setAttended(dates);
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

  const isCheckedToday = attended.has(todayKey);
  const streak = calcStreak(attended, today);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return attended.has(formatDateKey(d));
  });

  const cells = getCalendarDays(viewYear, viewMonth);

  const handleCheckIn = async () => {
    if (!user?.uid || isCheckedToday || checking) return;
    setChecking(true);
    try {
      await checkInToday(user.uid);
      setAttended((prev) => new Set(prev).add(todayKey));
      useNotificationStore.getState().syncStreakWarningForToday(true);
      const unlocked = await checkAchievements(user.uid);
      if (unlocked.length > 0) setNewBadges(unlocked);
    } catch {
    } finally {
      setChecking(false);
    }
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-text-primary">출석 체크</Text>

      {/* 스트릭 히어로 */}
      <View
        className="mt-6 items-center rounded-card p-7"
        style={{ backgroundColor: colors.pastelPeachLight }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="flame" size={40} color="#F97316" />
          <Text className="text-5xl font-bold text-text-primary">{streak}</Text>
        </View>
        <Text className="mt-2 text-lg font-semibold text-text-primary">
          {streak > 0 ? `${streak}일 연속 학습 중!` : "오늘부터 시작해볼까요?"}
        </Text>
        <Text className="mt-1 text-text-secondary">꾸준함이 실력이 됩니다</Text>

        {/* 이번 주 도트 */}
        <View className="mt-5 flex-row gap-2">
          {weekDots.map((done, i) => (
            <View key={i} className="items-center gap-1">
              <View
                className="h-9 w-9 items-center justify-center rounded-pill"
                style={{
                  backgroundColor: done ? colors.success : colors.surface,
                  borderWidth: 1.5,
                  borderColor: done ? colors.success : colors.border,
                }}
              >
                {done ? (
                  <Ionicons name="checkmark" size={18} color={colors.surface} />
                ) : null}
              </View>
              <Text className="text-xs text-text-secondary">{WEEK[i]}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleCheckIn}
          disabled={isCheckedToday || checking || !user?.uid}
          className="mt-6 w-full flex-row items-center justify-center gap-2 rounded-pill py-4 active:scale-[0.98]"
          style={{
            backgroundColor: isCheckedToday ? colors.pastelLime : colors.primary,
          }}
        >
          {checking ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Ionicons
                name={isCheckedToday ? "checkmark-circle" : "flame"}
                size={20}
                color={isCheckedToday ? colors.textPrimary : colors.surface}
              />
              <Text
                className="text-base font-bold"
                style={{ color: isCheckedToday ? colors.textPrimary : colors.surface }}
              >
                {isCheckedToday ? "오늘 출석 완료!" : "오늘 출석하기"}
              </Text>
            </>
          )}
        </Pressable>

        {streak > 0 ? (
          <View className="mt-3 w-full">
            <PillButton
              label="오늘 기록 공유하기"
              variant="ghost"
              icon="share-outline"
              onPress={() => setShareVisible(true)}
            />
          </View>
        ) : null}
      </View>

      {/* 캘린더 */}
      <View className="mt-6 rounded-card bg-surface p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={goPrevMonth} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            {viewYear}년 {viewMonth + 1}월
          </Text>
          <Pressable onPress={goNextMonth} hitSlop={10}>
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <View className="mb-2 flex-row">
          {WEEK.map((w) => (
            <Text
              key={w}
              className="flex-1 text-center text-xs font-semibold text-text-secondary"
            >
              {w}
            </Text>
          ))}
        </View>
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {cells.map((cell, i) => {
              const key = formatDateKey(cell.date);
              const isAttended = attended.has(key) && cell.inMonth;
              const isToday = key === todayKey;
              return (
                <View
                  key={i}
                  className="items-center justify-center py-1.5"
                  style={{ width: `${100 / 7}%` }}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-pill"
                    style={{
                      backgroundColor: isAttended ? colors.pastelLime : "transparent",
                      borderWidth: isToday ? 2 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    {isAttended ? (
                      <Ionicons name="checkmark" size={18} color={colors.textPrimary} />
                    ) : (
                      <Text
                        className="text-sm"
                        style={{
                          color: !cell.inMonth
                            ? colors.textSecondary
                            : isToday
                            ? colors.primary
                            : colors.textPrimary,
                          fontWeight: isToday ? "700" : "400",
                          opacity: cell.inMonth ? 1 : 0.4,
                        }}
                      >
                        {cell.date.getDate()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <BadgeUnlockOverlay badges={newBadges} onClose={() => setNewBadges([])} />

      <ShareCardModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        nickname={user?.displayName || user?.email?.split("@")[0] || "학습자"}
        headline={`${streak}일 연속 학습 중!`}
        stats={[
          { label: "연속 출석", value: `${streak}일` },
          { label: "오늘 날짜", value: todayKey.replaceAll("-", ".") },
        ]}
        dateLabel={todayKey.replaceAll("-", ".")}
        fileName="onebite-attendance"
      />
    </ScrollView>
  );
}
