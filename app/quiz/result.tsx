import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { AccuracyRing } from "@/components/AccuracyRing";
import { Confetti } from "@/components/Confetti";
import { PillButton } from "@/components/PillButton";
import { BadgeUnlockOverlay } from "@/components/BadgeUnlockOverlay";
import { ShareCardModal } from "@/components/ShareCardModal";
import { BADGES } from "@/constants/achievements";
import { useAuthStore } from "@/store/authStore";

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [shareVisible, setShareVisible] = useState(false);
  const params = useLocalSearchParams<{
    correct?: string;
    total?: string;
    mode?: string;
    time?: string;
    newBadges?: string;
  }>();

  const [newBadges, setNewBadges] = useState(() => {
    const ids = params.newBadges?.split(",").filter(Boolean) ?? [];
    return BADGES.filter((b) => ids.includes(b.id));
  });

  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 1);
  const wrong = Math.max(total - correct, 0);
  const seconds = Number(params.time ?? 0);
  const mode =
    params.mode === "blank" ? "blank" : params.mode === "listen" ? "listen" : "word";
  const percent = Math.round((correct / total) * 100);
  const passed = percent >= 60;

  const message = passed
    ? { text: "완벽해요, 잘하고 있어요", bg: colors.pastelLime }
    : { text: "조금 더 힘내볼까요", bg: colors.pastelPeach };

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
      {passed ? <Confetti /> : null}

      <Text className="text-center text-2xl font-bold text-text-primary">
        퀴즈 결과
      </Text>

      <View className="flex-1 items-center justify-center">
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={{ alignItems: "center" }}
        >
          <AccuracyRing percent={percent} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={{
            marginTop: 24,
            borderRadius: 999,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: message.bg,
          }}
        >
          <Text className="text-base font-bold text-text-primary">
            {message.text}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={{ marginTop: 28, flexDirection: "row", gap: 12 }}
        >
          <StatCard value={`${correct}`} label="맞은 문항" />
          <StatCard value={`${wrong}`} label="틀린 문항" />
          <StatCard value={formatTime(seconds)} label="소요 시간" />
        </Animated.View>
      </View>

      <View className="gap-3">
        <PillButton
          label="다음으로"
          onPress={() => router.replace("/(tabs)")}
        />
        <PillButton
          label="다시 학습하기"
          variant="secondary"
          onPress={() => router.replace(`/quiz/${mode}`)}
        />
        {wrong > 0 ? (
          <PillButton
            label="오답노트에서 복습하기"
            variant="ghost"
            icon="repeat"
            onPress={() => router.replace("/quiz/review")}
          />
        ) : null}
        {passed ? (
          <PillButton
            label="인증 카드 공유"
            variant="ghost"
            icon="share-outline"
            onPress={() => setShareVisible(true)}
          />
        ) : null}
      </View>

      <BadgeUnlockOverlay badges={newBadges} onClose={() => setNewBadges([])} />

      <ShareCardModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        nickname={user?.displayName || user?.email?.split("@")[0] || "학습자"}
        headline="퀴즈를 완료했어요!"
        stats={[
          { label: "정답률", value: `${percent}%` },
          { label: "맞은 문항", value: `${correct}/${total}` },
          { label: "소요 시간", value: formatTime(seconds) },
        ]}
        dateLabel={formatToday()}
        fileName="onebite-quiz-result"
      />
    </ScrollView>
  );
}

function formatToday() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View
      className="flex-1 items-center rounded-2xl border py-5"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        minWidth: 0,
      }}
    >
      <Text
        numberOfLines={1}
        className="text-lg font-bold text-text-primary"
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        className="mt-1 text-xs text-text-secondary"
        style={{ textAlign: "center" }}
      >
        {label}
      </Text>
    </View>
  );
}
