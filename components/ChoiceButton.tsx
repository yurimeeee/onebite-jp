import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";

type Props = {
  label: string;
  isCorrectAnswer: boolean;
  isSelected: boolean;
  revealed: boolean;
  onPress: () => void;
  fontClass?: string;
};

export function ChoiceButton({
  label,
  isCorrectAnswer,
  isSelected,
  revealed,
  onPress,
  fontClass = "",
}: Props) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);

  useEffect(() => {
    if (!revealed || !isSelected) return;
    if (isCorrectAnswer) {
      scale.value = withSequence(withSpring(1.05), withSpring(1));
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      shake.value = withSequence(
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(-6, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [revealed]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  let bg: string = colors.surface;
  let borderColor: string = colors.border;
  let opacity = 1;
  if (revealed && isCorrectAnswer) {
    bg = colors.successSoft;
    borderColor = colors.success;
  } else if (isSelected && !isCorrectAnswer) {
    bg = colors.dangerSoft;
    borderColor = colors.danger;
  } else if (revealed) {
    opacity = 0.55;
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={revealed}
        className="flex-row items-center justify-between rounded-2xl px-5 py-4 active:scale-[0.99]"
        style={{ backgroundColor: bg, borderWidth: 2, borderColor, opacity }}
      >
        <Text className={`text-lg font-bold text-text-primary ${fontClass}`}>
          {label}
        </Text>
        {revealed && isCorrectAnswer ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        ) : isSelected && !isCorrectAnswer ? (
          <Ionicons name="close-circle" size={24} color={colors.danger} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
