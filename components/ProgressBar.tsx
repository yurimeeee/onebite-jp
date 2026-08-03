import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

export function ProgressBar({ progress }: { progress: number }) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 500,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View className="h-3 flex-1 overflow-hidden rounded-pill bg-border">
      <Animated.View
        style={[
          { height: "100%", borderRadius: 999, backgroundColor: colors.primary },
          animatedStyle,
        ]}
      />
    </View>
  );
}
