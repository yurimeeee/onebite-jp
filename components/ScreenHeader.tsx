import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { safeBack } from "@/utils/navigation";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        hitSlop={12}
        onPress={() => safeBack(router)}
        className="h-10 w-10 items-center justify-center rounded-pill bg-surface active:scale-95"
        style={{ borderWidth: 1, borderColor: colors.border }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </Pressable>
      <View>
        {subtitle ? (
          <Text className="text-sm font-semibold text-text-secondary">
            {subtitle}
          </Text>
        ) : null}
        <Text className="text-2xl font-bold text-text-primary">{title}</Text>
      </View>
    </View>
  );
}
