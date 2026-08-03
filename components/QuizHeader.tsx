import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ProgressBar } from "./ProgressBar";

export function QuizHeader({
  progress,
  index,
  total,
  onClose,
}: {
  progress: number;
  index: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable hitSlop={12} onPress={onClose}>
        <Ionicons name="close" size={28} color={colors.textSecondary} />
      </Pressable>
      <ProgressBar progress={progress} />
      <Text className="w-12 text-right text-sm font-bold text-text-secondary">
        {index}/{total}
      </Text>
    </View>
  );
}
