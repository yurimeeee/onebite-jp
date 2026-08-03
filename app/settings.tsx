import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleVibration = useSettingsStore((s) => s.toggleVibration);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-pill bg-surface"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text className="text-2xl font-bold text-text-primary">환경 설정</Text>
      </View>

      <View className="mt-8 overflow-hidden rounded-card bg-surface">
        <SettingRow
          icon="volume-high-outline"
          bg={colors.pastelCyanLight}
          label="사운드 효과음"
          description="단어 발음, 정답/오답 효과음"
          value={soundEnabled}
          onChange={toggleSound}
        />
        <SettingRow
          icon="phone-portrait-outline"
          bg={colors.pastelPeachLight}
          label="진동"
          description="정답/오답 시 진동 피드백"
          value={vibrationEnabled}
          onChange={toggleVibration}
          border
        />
      </View>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  bg,
  label,
  description,
  value,
  onChange,
  border,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
  border?: boolean;
}) {
  return (
    <View
      className="flex-row items-center gap-3 px-5 py-4"
      style={border ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-pill"
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{label}</Text>
        <Text className="mt-0.5 text-xs text-text-secondary">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}
