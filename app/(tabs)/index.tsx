import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Mode = "word" | "blank" | "listen" | "swipe" | "radio" | "timeattack";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const selectMode = (mode: Mode) => {
    router.push(`/learn/level?mode=${mode}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-sm font-semibold text-text-secondary">오늘도 한 입</Text>
      <Text className="mt-1 text-3xl font-bold text-text-primary">
        무엇을 배워볼까요?
      </Text>

      {/* 모드 선택 */}
      <View className="mt-6 gap-4">
        <ModeCard
          onPress={() => selectMode("word")}
          title="단어 퀴즈"
          desc="4지선다로 빠르게 어휘 암기"
          minutes={3}
          icon="albums"
          bg={colors.pastelCyanLight}
        />
        <ModeCard
          onPress={() => selectMode("blank")}
          title="빈칸 채우기"
          desc="문장 속에서 자연스럽게 익히기"
          minutes={5}
          icon="create"
          bg={colors.pastelAmberLight}
        />
        <ModeCard
          onPress={() => selectMode("listen")}
          title="리스닝 퀴즈"
          desc="발음을 듣고 뜻 맞히기"
          minutes={4}
          icon="headset"
          bg={colors.pastelPinkLight}
        />
      </View>

      {/* 서브 학습 모드 */}
      <Text className="mb-3 mt-8 text-base font-bold text-text-primary">
        서브 학습 모드
      </Text>
      <View className="gap-4">
        <ModeCard
          onPress={() => selectMode("swipe")}
          title="👀 뇌 빼고 단어 넘기기"
          desc="숏폼처럼 스와이프로 빠르게 훑어보기"
          minutes={2}
          icon="albums-outline"
          bg={colors.pastelLimeLight}
        />
        <ModeCard
          onPress={() => selectMode("radio")}
          title="🎧 출퇴근 라디오"
          desc="화면 없이 듣기만 해도 되는 오디오 학습"
          minutes={10}
          icon="radio-outline"
          bg={colors.pastelCyanLight}
        />
        <ModeCard
          onPress={() => selectMode("timeattack")}
          title="⏱️ 5초 타임어택"
          desc="제한시간 안에 스피드로 맞히기"
          minutes={2}
          icon="flash-outline"
          bg={colors.pastelAmberLight}
        />
      </View>
    </ScrollView>
  );
}

function ModeCard({
  onPress,
  title,
  desc,
  minutes,
  icon,
  bg,
}: {
  onPress: () => void;
  title: string;
  desc: string;
  minutes: number;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-card p-5 active:scale-[0.98]"
      style={{ backgroundColor: bg, borderWidth: 2, borderColor: "transparent" }}
    >
      <View className="flex-row items-center justify-between">
        <View className="h-12 w-12 items-center justify-center rounded-pill bg-surface">
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </View>
      <Text className="mt-4 text-xl font-bold text-text-primary">{title}</Text>
      <Text className="mt-1 text-text-secondary">{desc}</Text>
      <View className="mt-3 flex-row items-center gap-1">
        <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
        <Text className="text-sm text-text-secondary">약 {minutes}분</Text>
      </View>
    </Pressable>
  );
}
