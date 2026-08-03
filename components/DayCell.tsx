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
        backgroundColor: done ? colors.pastelLime : colors.surface,
        borderWidth: current ? 2 : 1,
        borderColor: current ? colors.primary : colors.border,
      }}
    >
      {done ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.textPrimary} />
      ) : (
        <View className="h-2.5 w-2.5 rounded-pill bg-primary" />
      )}
      <Text className="mt-2 text-base font-bold" style={{ color: colors.textPrimary }}>
        Day {day.day}
      </Text>
    </Pressable>
  );
}
