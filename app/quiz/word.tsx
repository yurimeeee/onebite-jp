import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { colors, type LevelKey } from "@/constants/theme";
import { QuizHeader } from "@/components/QuizHeader";
import { ChoiceButton } from "@/components/ChoiceButton";
import { PillButton } from "@/components/PillButton";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";
import { getWordsForDay, markDayCompleted } from "@/services/quiz";
import { checkAchievements } from "@/services/achievements";
import { awardWeeklyXP } from "@/services/leaderboard";
import type { Word } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";
import { safeBack } from "@/utils/navigation";

export default function WordQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { level, day } = useLocalSearchParams<{ level: string; day: string }>();
  const levelKey = level as LevelKey;
  const dayNumber = Number(day);

  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWordsForDay(levelKey, dayNumber);
        if (!cancelled) setWords(shuffle(data));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelKey, dayNumber]);

  const total = words?.length ?? 0;
  const q = words?.[index];
  const revealed = selected !== null;

  const choices = useMemo(() => {
    if (!q || !words) return [];
    const wrongPool = shuffle(
      words.filter((w) => w.ko !== q.ko).map((w) => w.ko)
    ).slice(0, 3);
    return shuffle([q.ko, ...wrongPool]);
  }, [q, words]);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const furiganaEnabled = useSettingsStore((s) => s.furiganaEnabled);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const addWrong = useWrongAnswerStore((s) => s.addWrong);
  const removeWrong = useWrongAnswerStore((s) => s.removeWrong);
  const isSaved = useSavedWordsStore((s) => (q ? s.isSaved(q.wordId) : false));
  const toggleSave = useSavedWordsStore((s) => s.toggleSave);

  const speak = () => {
    if (!q || !soundEnabled) return;
    Speech.speak(q.jp, { language: "ja-JP", rate: speechRate });
  };

  const onSelect = (choice: string) => {
    if (revealed || !q) return;
    setSelected(choice);
    const id = `word:${q.wordId}`;
    if (choice === q.ko) {
      setCorrectCount((c) => c + 1);
      removeWrong(id);
    } else {
      addWrong({
        id,
        mode: "word",
        level: levelKey,
        addedAt: Date.now(),
        word: q,
        wordOptions: choices,
      });
    }
  };

  const next = async () => {
    if (index + 1 >= total) {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      let newBadgeIds: string[] = [];
      if (user?.uid) {
        try {
          await markDayCompleted(user.uid, levelKey, dayNumber, correctCount, total);
        } catch {}
        if (correctCount > 0) {
          try {
            await awardWeeklyXP(user.uid, correctCount * 10);
          } catch {}
        }
        newBadgeIds = (await checkAchievements(user.uid)).map((b) => b.id);
      }
      const badgeParam = newBadgeIds.length > 0 ? `&newBadges=${newBadgeIds.join(",")}` : "";
      router.replace(
        `/quiz/result?correct=${correctCount}&total=${total}&mode=word&time=${seconds}${badgeParam}`
      );
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
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

  if (!words || !q) {
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
      <QuizHeader
        progress={index / total}
        index={index + 1}
        total={total}
        onClose={() => safeBack(router)}
      />

      {/* 단어 카드 */}
      <Animated.View
        key={q.wordId}
        entering={FadeIn.duration(300)}
        style={{
          marginTop: 32,
          alignItems: "center",
          borderRadius: 24,
          backgroundColor: colors.surface,
          padding: 32,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        <Text className="text-6xl font-bold text-text-primary">{q.jp}</Text>
        {furiganaEnabled ? (
          <Text className="mt-3 text-xl text-text-secondary">{q.kana}</Text>
        ) : null}
        <View className="mt-6 flex-row gap-3">
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
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </Animated.View>

      <Text className="mb-3 mt-8 text-base font-semibold text-text-secondary">
        알맞은 뜻을 골라주세요
      </Text>

      <View className="gap-3">
        {choices.map((c) => (
          <ChoiceButton
            key={c}
            label={c}
            isCorrectAnswer={c === q.ko}
            isSelected={selected === c}
            revealed={revealed}
            onPress={() => onSelect(c)}
          />
        ))}
      </View>

      <View className="flex-1 justify-end">
        {revealed ? (
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <PillButton
              label={index + 1 >= total ? "결과 보기" : "계속하기"}
              icon="arrow-forward"
              onPress={next}
            />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
