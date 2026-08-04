import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { colors, type LevelKey } from "@/constants/theme";
import { QuizHeader } from "@/components/QuizHeader";
import { ChoiceButton } from "@/components/ChoiceButton";
import { PillButton } from "@/components/PillButton";
import { useAuthStore } from "@/store/authStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import { getFillInBlankQuizzes } from "@/services/quiz";
import { awardWeeklyXP } from "@/services/leaderboard";
import type { FillInBlankQuiz } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";

export default function BlankQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { level } = useLocalSearchParams<{ level: string }>();
  const levelKey = level as LevelKey;

  const [quizzes, setQuizzes] = useState<FillInBlankQuiz[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getFillInBlankQuizzes(levelKey);
        if (!cancelled) setQuizzes(shuffle(data));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelKey]);

  const total = quizzes?.length ?? 0;
  const q = quizzes?.[index];
  const revealed = selectedId !== null;
  const isCorrect = selectedId === q?.answerId;

  const options = useMemo(() => (q ? shuffle(q.options) : []), [q]);
  const addWrong = useWrongAnswerStore((s) => s.addWrong);
  const removeWrong = useWrongAnswerStore((s) => s.removeWrong);

  const onSelect = (optionId: number) => {
    if (revealed || !q) return;
    setSelectedId(optionId);
    const id = `blank:${q.quizId}`;
    if (optionId === q.answerId) {
      setCorrectCount((c) => c + 1);
      removeWrong(id);
    } else {
      addWrong({ id, mode: "blank", level: levelKey, addedAt: Date.now(), quiz: q });
    }
  };

  const next = async () => {
    if (index + 1 >= total) {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (user?.uid && correctCount > 0) {
        try {
          await awardWeeklyXP(user.uid, correctCount * 10);
        } catch {}
      }
      router.replace(
        `/quiz/result?correct=${correctCount}&total=${total}&mode=blank&time=${seconds}`
      );
      return;
    }
    setIndex((i) => i + 1);
    setSelectedId(null);
    setShowHint(false);
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-text-secondary">문제를 불러오지 못했어요</Text>
        <View className="mt-4">
          <PillButton label="돌아가기" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  if (!quizzes || !q) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const blankMarker = q.sentence.match(/___|\(\s*\)/)?.[0];
  const [before, after] = blankMarker
    ? q.sentence.split(blankMarker)
    : [q.sentence, ""];
  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <View
      className="flex-1 bg-background px-5"
      style={{ paddingTop: insets.top + 8 }}
    >
      <QuizHeader
        progress={index / total}
        index={index + 1}
        total={total}
        onClose={() => router.back()}
      />

      <Text className="mb-3 mt-8 text-base font-semibold text-text-secondary">
        빈칸에 알맞은 말을 고르세요
      </Text>

      {/* 문장 카드 */}
      <Animated.View
        key={q.quizId}
        entering={FadeIn.duration(300)}
        style={{
          borderRadius: 24,
          backgroundColor: colors.surface,
          padding: 28,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        <Text className="text-2xl leading-10 text-text-primary">
          {before}
          {blankMarker ? (
            <Text
              className="font-bold"
              style={{
                color: revealed
                  ? isCorrect
                    ? colors.success
                    : colors.danger
                  : colors.primary,
              }}
            >
              {revealed ? selectedOption?.text ?? "___" : "___"}
            </Text>
          ) : null}
          {after}
        </Text>
        <Text className="mt-2 text-text-secondary">{q.translation}</Text>
      </Animated.View>

      {!showHint && !revealed ? (
        <Pressable
          onPress={() => setShowHint(true)}
          className="mt-4 self-center rounded-pill px-4 py-2"
          style={{ backgroundColor: colors.pastelAmberLight }}
        >
          <Text className="text-sm font-bold text-text-primary">힌트 보기</Text>
        </Pressable>
      ) : null}
      {showHint && !revealed ? (
        <View
          className="mt-4 rounded-2xl p-3"
          style={{ backgroundColor: colors.pastelAmberLight }}
        >
          <Text className="text-center text-sm text-text-primary">{q.hint}</Text>
        </View>
      ) : null}

      <View className="mt-6 gap-3">
        {options.map((option) => (
          <ChoiceButton
            key={option.id}
            label={`${option.text}  ${option.ko}`}
            isCorrectAnswer={option.id === q.answerId}
            isSelected={selectedId === option.id}
            revealed={revealed}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>

      {/* 해설 슬라이드업 */}
      {revealed ? (
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: colors.surface,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            elevation: 8,
          }}
        >
          <Text
            className="text-lg font-bold"
            style={{ color: isCorrect ? colors.success : colors.danger }}
          >
            {isCorrect ? "정답이에요!" : "아쉬워요, 다시 볼까요?"}
          </Text>
          <View
            className="mt-3 rounded-2xl p-4"
            style={{ backgroundColor: colors.pastelAmberLight }}
          >
            <Text className="text-text-primary">{q.explanation}</Text>
          </View>
          <View className="mt-5">
            <PillButton
              label={index + 1 >= total ? "결과 보기" : "계속하기"}
              icon="arrow-forward"
              onPress={next}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
