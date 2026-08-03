import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useSettingsStore } from "@/store/settingsStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";

export default function SavedWordsScreen() {
  const insets = useSafeAreaInsets();
  const items = useSavedWordsStore((s) => s.items);
  const removeSaved = useSavedWordsStore((s) => s.removeSaved);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const speak = (jp: string) => {
    if (!soundEnabled) return;
    Speech.speak(jp, { language: "ja-JP", rate: 0.9 });
  };

  return (
    <View
      className="flex-1 bg-background px-5"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
    >
      <ScreenHeader title="저장한 단어" subtitle="즐겨찾기한 단어 모아보기" />

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="bookmark-outline" size={56} color={colors.textSecondary} />
          <Text className="mt-4 text-center text-base text-text-secondary">
            아직 저장한 단어가 없어요{"\n"}단어 학습 중 북마크를 눌러 저장해보세요
          </Text>
        </View>
      ) : (
        <ScrollView
          className="mt-6"
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.duration(200)}
              className="flex-row items-center justify-between rounded-card bg-surface p-4"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-xl font-bold text-text-primary">{item.word.jp}</Text>
                  <Text className="text-sm text-text-secondary">{item.word.kana}</Text>
                </View>
                <Text className="mt-1 text-text-secondary">{item.word.ko}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  hitSlop={8}
                  onPress={() => speak(item.word.jp)}
                  className="h-10 w-10 items-center justify-center rounded-pill active:scale-95"
                  style={{ backgroundColor: colors.pastelCyanLight }}
                >
                  <Ionicons name="volume-high" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  onPress={() => removeSaved(item.id)}
                  className="h-10 w-10 items-center justify-center rounded-pill active:scale-95"
                  style={{ backgroundColor: colors.pastelPinkLight }}
                >
                  <Ionicons name="bookmark" size={18} color={colors.primary} />
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
