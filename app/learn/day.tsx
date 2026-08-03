import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, levels, type LevelKey } from "@/constants/theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DayCell, type DayItem } from "@/components/DayCell";
import { useAuthStore } from "@/store/authStore";
import {
  getDaysForLevel,
  getLastStudy,
  getUserHistoryMap,
  type HistoryEntry,
} from "@/services/quiz";

const MODE_LABEL: Record<string, string> = {
  word: "단어 퀴즈",
  blank: "빈칸 채우기",
  listen: "리스닝 퀴즈",
};

export default function DaySelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { mode, level } = useLocalSearchParams<{ mode: string; level: string }>();
  const modeKey = mode === "blank" ? "blank" : mode === "listen" ? "listen" : "word";
  const levelInfo = levels.find((l) => l.key === level) ?? levels[0];
  const levelKey = levelInfo.key as LevelKey;

  const [days, setDays] = useState<DayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [dayNumbers, historyMap, lastStudy] = await Promise.all([
          getDaysForLevel(levelKey),
          user?.uid
            ? getUserHistoryMap(user.uid)
            : Promise.resolve({} as Record<string, HistoryEntry>),
          user?.uid ? getLastStudy(user.uid) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setDays(
          dayNumbers.map((day) => {
            const completed = historyMap[`${levelKey}_day${day}`]?.completed;
            const isLastStudied =
              lastStudy?.last_study_level === levelKey &&
              lastStudy?.last_study_day === day;
            return {
              day,
              status: completed ? "done" : isLastStudied ? "current" : "todo",
            };
          })
        );
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelKey, user?.uid]);

  const startQuiz = (day: DayItem) => {
    router.push(`/quiz/${modeKey}?level=${levelKey}&day=${day.day}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        subtitle={`${MODE_LABEL[modeKey]} · ${levelInfo.label}`}
        title="Day를 선택하세요"
      />

      {loading ? (
        <View className="mt-16 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View className="mt-16 items-center">
          <Text className="text-text-secondary">문제를 불러오지 못했어요</Text>
        </View>
      ) : days.length === 0 ? (
        <View className="mt-16 items-center">
          <Text className="text-text-secondary">아직 등록된 문제가 없어요</Text>
        </View>
      ) : (
        <View className="mt-8 flex-row flex-wrap justify-between">
          {days.map((d) => (
            <DayCell key={d.day} day={d} onPress={() => startQuiz(d)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
