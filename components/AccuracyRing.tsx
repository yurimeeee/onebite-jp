import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/constants/theme";

export function AccuracyRing({
  percent,
  size = 180,
}: {
  percent: number;
  size?: number;
}) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(101,115,240,0.15)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-5xl font-bold text-text-primary">{percent}%</Text>
        <Text className="mt-1 text-text-secondary">정답률</Text>
      </View>
    </View>
  );
}
