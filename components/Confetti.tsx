import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

const { width } = Dimensions.get("window");
const PIECES = 24;
const palette = [
  colors.pastelCyan,
  colors.pastelLime,
  colors.pastelPeach,
  colors.pastelPink,
  colors.pastelAmber,
  colors.primary,
];

function Piece({ index }: { index: number }) {
  const translateY = useSharedValue(-40);
  const rotate = useSharedValue(0);
  const startX = (index / PIECES) * width + (Math.random() * 30 - 15);
  const drift = Math.random() * 80 - 40;
  const color = palette[index % palette.length];
  const size = 8 + Math.random() * 8;
  const delay = Math.random() * 400;
  const duration = 1800 + Math.random() * 1200;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(Dimensions.get("window").height + 40, {
        duration,
        easing: Easing.in(Easing.quad),
      })
    );
    rotate.value = withDelay(
      delay,
      withTiming(6, { duration, easing: Easing.linear })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: drift * (translateY.value / 400) },
      { rotate: `${rotate.value * 180}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: startX,
          top: 0,
          width: size,
          height: size * 1.4,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function Confetti() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      {Array.from({ length: PIECES }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}
