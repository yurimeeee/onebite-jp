import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors, type LevelKey } from "@/constants/theme";
import { QuizHeader } from "@/components/QuizHeader";
import { ChoiceButton } from "@/components/ChoiceButton";
import { PillButton } from "@/components/PillButton";
import { useAuthStore } from "@/store/authStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import { getAllWordsForLevel } from "@/services/quiz";
import { checkAchievements } from "@/services/achievements";
import { awardWeeklyXP } from "@/services/leaderboard";
import type { Word } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";
import { safeBack } from "@/utils/navigation";

const TIME_LIMIT_MS = 5000;
const SESSION_SIZE = 15;
const REVEAL_DELAY_CORRECT = 650;
const REVEAL_DELAY_WRONG = 900;

type Phase = "playing" | "done";

export default function TimeAttackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { level } = useLocalSearchParams<{ level: string }>();
  const levelKey = level as LevelKey;

  const addWrong = useWrongAnswerStore((s) => s.addWrong);
  const removeWrong = useWrongAnswerStore((s) => s.removeWrong);

  const [pool, setPool] = useState<Word[] | null>(null);
  const [error, setError] = useState(false);
  const [session, setSession] = useState<Word[] | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(TIME_LIMIT_MS);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const correctCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllWordsForLevel(levelKey);
        if (cancelled) return;
        setPool(data);
        setSession(shuffle(data).slice(0, Math.min(SESSION_SIZE, data.length)));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelKey]);

  const total = session?.length ?? 0;
  const q = session?.[index];
  const revealed = selected !== null || timedOut;

  const choices = useMemo(() => {
    if (!q || !pool) return [];
    const wrongPool = shuffle(pool.filter((w) => w.ko !== q.ko).map((w) => w.ko)).slice(0, 3);
    return shuffle([q.ko, ...wrongPool]);
  }, [q, pool]);

  // 문제가 바뀔 때마다 5초 카운트다운을 새로 시작한다.
  useEffect(() => {
    if (!q || phase !== "playing") return;
    setRemaining(TIME_LIMIT_MS);
    const start = Date.now();
    const id = setInterval(() => {
      const left = TIME_LIMIT_MS - (Date.now() - start);
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        setTimedOut(true);
      } else {
        setRemaining(left);
      }
    }, 50);
    return () => clearInterval(id);
  }, [q?.wordId, phase]);

  // 정답/시간초과가 확정되면 콤보와 오답노트를 갱신하고 잠시 후 다음 문제로 넘어간다.
  useEffect(() => {
    if (!revealed || !q) return;
    const id = `timeattack:${q.wordId}`;
    const isCorrect = selected === q.ko;

    if (isCorrect) {
      correctCountRef.current += 1;
      setCorrectCount((c) => c + 1);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      removeWrong(id);
    } else {
      setCombo(0);
      addWrong({ id, mode: "timeattack", level: levelKey, addedAt: Date.now(), word: q, wordOptions: choices });
    }

    const delay = isCorrect ? REVEAL_DELAY_CORRECT : REVEAL_DELAY_WRONG;
    const timeout = setTimeout(() => finishQuestion(), delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  const finishQuestion = async () => {
    if (!session) return;
    if (index + 1 >= session.length) {
      if (user?.uid) {
        if (correctCountRef.current > 0) {
          try {
            await awardWeeklyXP(user.uid, correctCountRef.current * 10);
          } catch {}
        }
        try {
          setNewBadgeIds((await checkAchievements(user.uid)).map((b) => b.id));
        } catch {}
      }
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimedOut(false);
  };

  const onSelect = (choice: string) => {
    if (revealed || !q) return;
    setSelected(choice);
  };

  const restart = () => {
    if (!pool) return;
    setSession(shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length)));
    setIndex(0);
    setSelected(null);
    setTimedOut(false);
    correctCountRef.current = 0;
    setCorrectCount(0);
    setCombo(0);
    setBestCombo(0);
    setNewBadgeIds([]);
    setPhase("playing");
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

  if (!session || !q) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (phase === "done") {
    const percent = Math.round((correctCount / total) * 100);
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text className="text-center text-2xl font-bold text-text-primary">
          타임어택 완료!
        </Text>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="flash" size={56} color={colors.primary} />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            {correctCount} / {total} 정답 · {percent}%
          </Text>
          <Text className="mt-1 text-center text-text-secondary">
            최고 콤보 {bestCombo}연속 정답
          </Text>
          {newBadgeIds.length > 0 ? (
            <Text className="mt-3 text-center text-sm font-bold" style={{ color: colors.primary }}>
              새로운 업적을 달성했어요!
            </Text>
          ) : null}
        </View>
        <View className="gap-3">
          <PillButton label="다시 도전" icon="refresh" onPress={restart} />
          <PillButton
            label="홈으로"
            variant="secondary"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>
      </ScrollView>
    );
  }

  const timeRatio = remaining / TIME_LIMIT_MS;
  const barColor =
    remaining < 1500 ? colors.danger : remaining < 3000 ? colors.pastelAmber : colors.primary;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <QuizHeader
        progress={index / total}
        index={index + 1}
        total={total}
        onClose={() => safeBack(router)}
      />

      <View className="mt-4 flex-row items-center justify-between">
        <View className="h-2 flex-1 overflow-hidden rounded-pill bg-border">
          <View
            style={{
              height: "100%",
              width: `${Math.max(timeRatio, 0) * 100}%`,
              backgroundColor: barColor,
              borderRadius: 999,
            }}
          />
        </View>
        {combo >= 2 ? (
          <View
            className="ml-3 rounded-pill px-3 py-1"
            style={{ backgroundColor: colors.pastelAmberLight }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              🔥 콤보 x{combo}
            </Text>
          </View>
        ) : null}
      </View>

      <Animated.View
        key={q.wordId}
        entering={FadeIn.duration(200)}
        style={{
          marginTop: 24,
          alignItems: "center",
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
        <Text className="text-6xl font-bold text-text-primary">{q.jp}</Text>
        <Text className="mt-3 text-xl text-text-secondary">{q.kana}</Text>
      </Animated.View>

      <Text className="mb-3 mt-8 text-base font-semibold text-text-secondary">
        {timedOut ? "시간 초과!" : "알맞은 뜻을 골라주세요"}
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
    </ScrollView>
  );
}
