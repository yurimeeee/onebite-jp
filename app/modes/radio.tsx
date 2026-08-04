import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors, type LevelKey } from "@/constants/theme";
import { PillButton } from "@/components/PillButton";
import { QuizHeader } from "@/components/QuizHeader";
import { useSettingsStore } from "@/store/settingsStore";
import { getAllWordsForLevel } from "@/services/quiz";
import type { Word } from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";

type Phase = "jp" | "ko" | null;

export default function RadioModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level } = useLocalSearchParams<{ level: string }>();
  const levelKey = level as LevelKey;
  const speechRate = useSettingsStore((s) => s.speechRate);

  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>(null);

  // 재생 세션을 취소하기 위한 토큰. 값이 바뀌면 이전 콜백 체인은 스스로 멈춘다.
  const sessionIdRef = useRef(0);
  const wordsRef = useRef<Word[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllWordsForLevel(levelKey);
        const list = shuffle(data);
        if (!cancelled) {
          setWords(list);
          wordsRef.current = list;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelKey]);

  useEffect(
    () => () => {
      sessionIdRef.current += 1;
      Speech.stop();
    },
    []
  );

  const step = (sid: number, idx: number, stepPhase: "jp" | "ko") => {
    if (sid !== sessionIdRef.current) return;
    const word = wordsRef.current[idx];
    if (!word) return;
    setIndex(idx);
    setPhase(stepPhase);

    const text = stepPhase === "jp" ? word.jp : word.ko;
    const language = stepPhase === "jp" ? "ja-JP" : "ko-KR";
    const rate = stepPhase === "jp" ? speechRate : 1.0;

    Speech.speak(text, {
      language,
      rate,
      onDone: () => {
        if (sid !== sessionIdRef.current) return;
        setTimeout(() => {
          if (sid !== sessionIdRef.current) return;
          if (stepPhase === "jp") {
            step(sid, idx, "ko");
          } else {
            const nextIdx = (idx + 1) % wordsRef.current.length;
            step(sid, nextIdx, "jp");
          }
        }, stepPhase === "jp" ? 350 : 900);
      },
      onError: () => {
        if (sid !== sessionIdRef.current) return;
        const nextIdx = (idx + 1) % wordsRef.current.length;
        step(sid, nextIdx, "jp");
      },
    });
  };

  const playFrom = (idx: number) => {
    sessionIdRef.current += 1;
    const sid = sessionIdRef.current;
    setIsPlaying(true);
    step(sid, idx, "jp");
  };

  const pause = () => {
    sessionIdRef.current += 1;
    Speech.stop();
    setIsPlaying(false);
    setPhase(null);
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else playFrom(index);
  };

  const skip = (dir: 1 | -1) => {
    if (!wordsRef.current.length) return;
    const nextIdx = (index + dir + wordsRef.current.length) % wordsRef.current.length;
    if (isPlaying) playFrom(nextIdx);
    else setIndex(nextIdx);
  };

  const total = words?.length ?? 0;
  const q = words?.[index];

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-text-secondary">단어를 불러오지 못했어요</Text>
        <View className="mt-4">
          <PillButton label="돌아가기" onPress={() => router.back()} />
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
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <QuizHeader
        progress={index / total}
        index={index + 1}
        total={total}
        onClose={() => {
          pause();
          router.back();
        }}
      />

      <View className="flex-1 items-center justify-center">
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            height: 220,
            width: 220,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.pastelCyanLight,
          }}
        >
          <Ionicons
            name="radio"
            size={72}
            color={isPlaying ? colors.primary : colors.textSecondary}
          />
        </Animated.View>

        <Text className="mt-8 text-4xl font-bold text-text-primary">{q.jp}</Text>
        <Text
          className="mt-2 text-lg text-text-secondary"
          style={{ opacity: phase === "jp" ? 1 : 0.4 }}
        >
          {q.kana}
        </Text>
        <View
          className="mt-4 rounded-pill px-4 py-2"
          style={{
            backgroundColor: phase === "ko" ? colors.pastelLimeLight : colors.surface2,
          }}
        >
          <Text className="text-base font-bold text-text-primary">{q.ko}</Text>
        </View>

        <Text className="mt-5 text-sm text-text-secondary">
          {isPlaying
            ? "화면을 보지 않고 귀로만 들어도 괜찮아요"
            : "재생 버튼을 눌러 시작하세요"}
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-8">
        <Pressable
          hitSlop={12}
          onPress={() => skip(-1)}
          className="h-14 w-14 items-center justify-center rounded-pill active:scale-95"
          style={{ backgroundColor: colors.surface2 }}
        >
          <Ionicons name="play-skip-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={togglePlay}
          className="h-20 w-20 items-center justify-center rounded-pill active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={34} color={colors.surface} />
        </Pressable>
        <Pressable
          hitSlop={12}
          onPress={() => skip(1)}
          className="h-14 w-14 items-center justify-center rounded-pill active:scale-95"
          style={{ backgroundColor: colors.surface2 }}
        >
          <Ionicons name="play-skip-forward" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
