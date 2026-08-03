import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import Animated, { FadeIn, FadeInDown, SlideInDown } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { QuizHeader } from "@/components/QuizHeader";
import { ChoiceButton } from "@/components/ChoiceButton";
import { PillButton } from "@/components/PillButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useSettingsStore } from "@/store/settingsStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import type { WrongAnswerItem } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";

type Phase = "intro" | "playing" | "done";

export default function ReviewQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useWrongAnswerStore((s) => s.items);
  const addWrong = useWrongAnswerStore((s) => s.addWrong);
  const removeWrong = useWrongAnswerStore((s) => s.removeWrong);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<WrongAnswerItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [masteredCount, setMasteredCount] = useState(0);

  const total = session?.length ?? 0;
  const q = session?.[index];
  const revealed = selected !== null;

  const isWordLike = q?.mode === "word" || q?.mode === "listen";

  const wordChoices = useMemo(() => {
    if (!q || !isWordLike || !q.word) return [];
    return q.wordOptions && q.wordOptions.length > 0
      ? q.wordOptions
      : [q.word.ko];
  }, [q, isWordLike]);

  const blankOptions = useMemo(() => {
    if (!q || q.mode !== "blank" || !q.quiz) return [];
    return q.quiz.options;
  }, [q]);

  const startSession = () => {
    setSession(shuffle(items));
    setIndex(0);
    setSelected(null);
    setMasteredCount(0);
    setPhase("playing");
  };

  const speak = () => {
    if (!q?.word || !soundEnabled) return;
    Speech.speak(q.word.jp, { language: "ja-JP", rate: 0.9 });
  };

  const onSelectWord = (choice: string) => {
    if (revealed || !q?.word) return;
    setSelected(choice);
    if (choice === q.word.ko) {
      setMasteredCount((c) => c + 1);
      removeWrong(q.id);
    } else {
      addWrong({ ...q, addedAt: Date.now() });
    }
  };

  const onSelectBlank = (optionId: number) => {
    if (revealed || !q?.quiz) return;
    setSelected(optionId);
    if (optionId === q.quiz.answerId) {
      setMasteredCount((c) => c + 1);
      removeWrong(q.id);
    } else {
      addWrong({ ...q, addedAt: Date.now() });
    }
  };

  const next = () => {
    if (!session) return;
    if (index + 1 >= session.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  if (phase === "intro") {
    return (
      <View
        className="flex-1 bg-background px-5"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
      >
        <ScreenHeader title="오답노트" subtitle="틀린 문제 다시 풀기" />

        <View className="flex-1 items-center justify-center">
          {items.length === 0 ? (
            <>
              <Ionicons name="checkmark-circle-outline" size={56} color={colors.textSecondary} />
              <Text className="mt-4 text-center text-base text-text-secondary">
                아직 저장된 오답이 없어요{"\n"}퀴즈를 풀면 틀린 문제가 여기에 모여요
              </Text>
            </>
          ) : (
            <>
              <View
                className="h-16 w-16 items-center justify-center rounded-pill"
                style={{ backgroundColor: colors.pastelPeachLight }}
              >
                <Ionicons name="repeat" size={28} color={colors.primary} />
              </View>
              <Text className="mt-4 text-center text-lg font-bold text-text-primary">
                총 {items.length}개의 오답이 있어요
              </Text>
              <Text className="mt-1 text-center text-text-secondary">
                다시 풀어서 내 것으로 만들어봐요
              </Text>
            </>
          )}
        </View>

        {items.length > 0 ? (
          <View className="gap-3">
            <PillButton label="다시 풀기 시작" icon="play" onPress={startSession} />
          </View>
        ) : null}
      </View>
    );
  }

  if (phase === "done") {
    const remaining = items.length;
    return (
      <View
        className="flex-1 bg-background px-6"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      >
        <Text className="text-center text-2xl font-bold text-text-primary">복습 완료</Text>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="ribbon" size={56} color={colors.primary} />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            {masteredCount}개를 새로 맞혔어요
          </Text>
          <Text className="mt-1 text-center text-text-secondary">
            {remaining > 0 ? `아직 ${remaining}개가 남아있어요` : "오답노트를 모두 비웠어요"}
          </Text>
        </View>
        <View className="gap-3">
          {remaining > 0 ? (
            <PillButton label="남은 문제 다시 풀기" icon="repeat" onPress={startSession} />
          ) : null}
          <PillButton
            label="홈으로"
            variant="secondary"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>
      </View>
    );
  }

  if (!q) return null;

  if (isWordLike && q.word) {
    const word = q.word;
    return (
      <View
        className="flex-1 bg-background px-5"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
      >
        <QuizHeader
          progress={index / total}
          index={index + 1}
          total={total}
          onClose={() => router.back()}
        />

        <Animated.View
          key={word.wordId}
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
          <Text className="text-6xl font-bold text-text-primary">{word.jp}</Text>
          <Text className="mt-3 text-xl text-text-secondary">{word.kana}</Text>
          <Pressable
            onPress={speak}
            className="mt-6 h-12 w-12 items-center justify-center rounded-pill active:scale-95"
            style={{ backgroundColor: colors.pastelCyanLight }}
          >
            <Ionicons name="volume-high" size={22} color={colors.primary} />
          </Pressable>
        </Animated.View>

        <Text className="mb-3 mt-8 text-base font-semibold text-text-secondary">
          알맞은 뜻을 골라주세요
        </Text>

        <View className="gap-3">
          {wordChoices.map((c) => (
            <ChoiceButton
              key={c}
              label={c}
              isCorrectAnswer={c === word.ko}
              isSelected={selected === c}
              revealed={revealed}
              onPress={() => onSelectWord(c)}
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

  if (q.mode === "blank" && q.quiz) {
    const quiz = q.quiz;
    const isCorrect = selected === quiz.answerId;
    const blankMarker = quiz.sentence.match(/___|\(\s*\)/)?.[0];
    const [before, after] = blankMarker
      ? quiz.sentence.split(blankMarker)
      : [quiz.sentence, ""];
    const selectedOption = blankOptions.find((o) => o.id === selected);

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

        <Animated.View
          key={quiz.quizId}
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
          <Text className="mt-2 text-text-secondary">{quiz.translation}</Text>
        </Animated.View>

        <View className="mt-6 gap-3">
          {blankOptions.map((option) => (
            <ChoiceButton
              key={option.id}
              label={`${option.text}  ${option.ko}`}
              isCorrectAnswer={option.id === quiz.answerId}
              isSelected={selected === option.id}
              revealed={revealed}
              onPress={() => onSelectBlank(option.id)}
            />
          ))}
        </View>

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
              <Text className="text-text-primary">{quiz.explanation}</Text>
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

  return null;
}
