import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
};

export function PillButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
}: Props) {
  const box =
    variant === "primary"
      ? "bg-primary"
      : variant === "secondary"
      ? "bg-surface border-2 border-border"
      : "bg-transparent";
  const textColor =
    variant === "primary" ? "text-surface" : "text-text-primary";
  const iconColor = variant === "primary" ? colors.surface : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-pill py-4 px-6 active:scale-[0.98] ${box} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
          <Text className={`text-lg font-bold ${textColor}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconBadge({
  icon,
  bg,
  color,
  size = 48,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-pill"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </View>
  );
}
