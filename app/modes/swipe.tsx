import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, type LevelKey } from "@/constants/theme";
import { PillButton } from "@/components/PillButton";
import { useSettingsStore } from "@/store/settingsStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";
import { getAllWordsForLevel } from "@/services/quiz";
import type { Word } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";
import { safeBack } from "@/utils/navigation";

const SWIPE_THRESHOLD = 90;

export default function SwipeModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level } = useLocalSearchParams<{ level: string }>();
  const levelKey = level as LevelKey;

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const furiganaEnabled = useSettingsStore((s) => s.furiganaEnabled);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const toggleSave = useSavedWordsStore((s) => s.toggleSave);

  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const loadWords = () => {
    let cancelled = false;
    setError(false);
    setWords(null);
    setDone(false);
    setIndex(0);
    (async () => {
      try {
        const data = await getAllWordsForLevel(levelKey);
        if (!cancelled) setWords(shuffle(data));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => loadWords(), [levelKey]);
  useEffect(
    () => () => {
      Speech.stop();
    },
    []
  );

  const total = words?.length ?? 0;
  const q = words?.[index];
  const wordSaved = useSavedWordsStore((s) => (q ? s.isSaved(q.wordId) : false));

  const translateY = useSharedValue(0);

  const goNext = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= total) {
        setDone(true);
        return i;
      }
      return next;
    });
  };
  const goPrev = () => {
    setIndex((i) => Math.max(i - 1, 0));
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_THRESHOLD) {
        runOnJS(goNext)();
      } else if (e.translationY > SWIPE_THRESHOLD) {
        runOnJS(goPrev)();
      }
      translateY.value = withSpring(0, { damping: 18 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const speak = () => {
    if (!q || !soundEnabled) return;
    Speech.speak(q.jp, { language: "ja-JP", rate: speechRate });
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-text-secondary">단어를 불러오지 못했어요</Text>
        <View className="mt-4">
          <PillButton label="돌아가기" onPress={() => safeBack(router)} />
        </View>
      </View>
    );
  }

  if (!words) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background px-5"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable hitSlop={12} onPress={() => safeBack(router)}>
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </Pressable>
        <Text className="text-sm font-bold text-text-secondary">
          {Math.min(index + 1, total)} / {total}
        </Text>
      </View>

      {done || !q ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="sparkles" size={48} color={colors.primary} />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            모든 단어를 다 봤어요!
          </Text>
          <Text className="mt-1 text-center text-text-secondary">
            한 번 더 훑어보면서 감을 잡아봐요
          </Text>
          <View className="mt-8 w-full gap-3 px-4">
            <PillButton label="다시 넘기기" icon="refresh" onPress={loadWords} />
            <PillButton
              label="홈으로"
              variant="secondary"
              onPress={() => router.replace("/(tabs)")}
            />
          </View>
        </View>
      ) : (
        <>
          <View className="flex-1 items-center justify-center">
            <GestureDetector gesture={pan}>
              <Animated.View
                key={q.wordId}
                entering={FadeIn.duration(250)}
                style={[
                  cardStyle,
                  {
                    width: "100%",
                    alignItems: "center",
                    borderRadius: 28,
                    backgroundColor: colors.surface,
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 3,
                  },
                ]}
              >
                <Text className="text-6xl font-bold text-text-primary">{q.jp}</Text>
                {furiganaEnabled ? (
                  <Text className="mt-3 text-xl text-text-secondary">{q.kana}</Text>
                ) : null}
                <View
                  className="mt-6 rounded-pill px-4 py-2"
                  style={{ backgroundColor: colors.pastelLimeLight }}
                >
                  <Text className="text-lg font-bold text-text-primary">{q.ko}</Text>
                </View>

                <View className="mt-8 flex-row gap-3">
                  <Pressable
                    onPress={speak}
                    className="h-12 w-12 items-center justify-center rounded-pill active:scale-95"
                    style={{ backgroundColor: colors.pastelCyanLight }}
                  >
                    <Ionicons name="volume-high" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      toggleSave({ id: q.wordId, word: q, level: levelKey, addedAt: Date.now() })
                    }
                    className="h-12 w-12 items-center justify-center rounded-pill active:scale-95"
                    style={{ backgroundColor: colors.pastelPinkLight }}
                  >
                    <Ionicons
                      name={wordSaved ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>
              </Animated.View>
            </GestureDetector>
          </View>

          <View className="flex-row items-center justify-center gap-6 pb-2">
            <Pressable
              hitSlop={12}
              disabled={index === 0}
              onPress={goPrev}
              className="h-12 w-12 items-center justify-center rounded-pill active:scale-95"
              style={{ backgroundColor: colors.surface2, opacity: index === 0 ? 0.4 : 1 }}
            >
              <Ionicons name="chevron-up" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text className="text-xs text-text-secondary">위/아래로 스와이프</Text>
            <Pressable
              hitSlop={12}
              onPress={goNext}
              className="h-12 w-12 items-center justify-center rounded-pill active:scale-95"
              style={{ backgroundColor: colors.surface2 }}
            >
              <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
