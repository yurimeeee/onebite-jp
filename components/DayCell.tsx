import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export type DayStatus = "done" | "current" | "todo";
export type DayItem = { day: number; status: DayStatus };

export function DayCell({
  day,
  onPress,
}: {
  day: DayItem;
  onPress: () => void;
}) {
  const current = day.status === "current";
  const done = day.status === "done";

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 items-center justify-center rounded-card active:scale-95"
      style={{
        width: "31%",
        aspectRatio: 1,
        backgroundColor: done ? colors.successSoft : current ? colors.primaryLight : colors.surface,
        borderWidth: current ? 2 : 1,
        borderColor: current ? colors.primary : colors.border,
      }}
    >
      {done ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      ) : current ? (
        <View className="h-2.5 w-2.5 rounded-pill bg-primary" />
      ) : (
        <View
          className="h-2.5 w-2.5 rounded-pill"
          style={{ borderWidth: 1.5, borderColor: colors.textSecondary, opacity: 0.4 }}
        />
      )}
      <Text
        className="mt-2 text-base font-bold"
        style={{ color: current ? colors.primary : colors.textPrimary }}
      >
        Day {day.day}
      </Text>
      {current ? (
        <Text className="mt-0.5 text-[11px] font-semibold" style={{ color: colors.primary }}>
          진행중
        </Text>
      ) : null}
    </Pressable>
  );
}
