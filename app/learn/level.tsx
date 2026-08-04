import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, levels, type LevelKey } from "@/constants/theme";
import { ScreenHeader } from "@/components/ScreenHeader";

const MODE_LABEL: Record<string, string> = {
  word: "단어 퀴즈",
  blank: "빈칸 채우기",
  listen: "리스닝 퀴즈",
};

export default function LevelSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const modeKey = mode === "blank" ? "blank" : mode === "listen" ? "listen" : "word";

  const selectLevel = (level: LevelKey) => {
    if (modeKey === "blank") {
      // 빈칸 채우기는 일차 구분이 없어 레벨 선택 후 바로 퀴즈로 진입
      router.push(`/quiz/blank?level=${level}`);
      return;
    }
    router.push(`/learn/day?mode=${modeKey}&level=${level}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader subtitle={MODE_LABEL[modeKey]} title="레벨을 선택하세요" />

      <View className="mt-8 flex-row flex-wrap justify-between">
        {levels.map((l) => (
          <Pressable
            key={l.key}
            onPress={() => selectLevel(l.key)}
            className="mb-3 items-center justify-center rounded-card py-7 active:scale-[0.98]"
            style={{ width: "48%", backgroundColor: l.bg }}
          >
            <View
              className="h-3 w-3 rounded-pill"
              style={{ backgroundColor: l.chip }}
            />
            <Text className="mt-2 text-base font-bold text-text-primary">
              {l.label}
            </Text>
            <View
              className="mt-1.5 rounded-pill px-2 py-0.5"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-[11px] font-bold" style={{ color: colors.primary }}>
                JLPT {l.jlpt}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
