import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { DAILY_GOALS, type DailyGoalKey } from "@/constants/goals";
import { PillButton } from "@/components/PillButton";
import { useAuthStore } from "@/store/authStore";
import { useGoalStore } from "@/store/goalStore";

export default function GoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const currentGoal = useGoalStore((s) => s.dailyGoal);
  const setGoal = useGoalStore((s) => s.setGoal);
  const isChanging = !!currentGoal;

  const [selected, setSelected] = useState<DailyGoalKey>(
    currentGoal ?? DAILY_GOALS.find((g) => g.recommended)!.key
  );
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!user?.uid || saving) return;
    setSaving(true);
    try {
      await setGoal(user.uid, selected);
      if (isChanging) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      setSaving(false);
      Alert.alert("저장 실패", error?.message ?? "목표를 저장하지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {isChanging ? (
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          className="mb-4 h-10 w-10 items-center justify-center rounded-pill bg-surface"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : null}

      <Text className="text-center text-2xl font-bold text-text-primary">
        매일 얼마 동안{"\n"}공부하고 싶으신가요?
      </Text>
      <Text className="mt-3 text-center text-sm text-text-secondary">
        나중에 언제든지 변경할 수 있어요
      </Text>

      <View className="mt-8 flex-1 gap-3">
        {DAILY_GOALS.map((goal) => {
          const isSelected = selected === goal.key;
          return (
            <Pressable
              key={goal.key}
              onPress={() => setSelected(goal.key)}
              className="rounded-card p-5 active:scale-[0.98]"
              style={{
                backgroundColor: isSelected ? goal.color : colors.surface,
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <View className="flex-row items-center gap-4">
                <Text style={{ fontSize: 32 }}>{goal.emoji}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold text-text-primary">
                      {goal.title} ({goal.tier})
                    </Text>
                    {goal.recommended ? (
                      <View
                        className="rounded-pill px-2 py-0.5"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-xs font-bold text-surface">추천</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="mt-1 text-sm text-text-secondary">{goal.subtitle}</Text>
                </View>
                <View
                  className="h-6 w-6 items-center justify-center rounded-pill"
                  style={{
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : "transparent",
                  }}
                >
                  {isSelected ? (
                    <View
                      className="h-2.5 w-2.5 rounded-pill"
                      style={{ backgroundColor: colors.surface }}
                    />
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-8">
        <PillButton label="이 목표로 시작하기" loading={saving} onPress={handleConfirm} />
      </View>
    </ScrollView>
  );
}
