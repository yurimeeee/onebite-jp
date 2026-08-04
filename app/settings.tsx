import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { SPEECH_RATES, useSettingsStore, type SpeechRate } from "@/store/settingsStore";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const furiganaEnabled = useSettingsStore((s) => s.furiganaEnabled);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleVibration = useSettingsStore((s) => s.toggleVibration);
  const toggleFurigana = useSettingsStore((s) => s.toggleFurigana);
  const setSpeechRate = useSettingsStore((s) => s.setSpeechRate);

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
        <SettingRow
          icon="text-outline"
          bg={colors.pastelLimeLight}
          label="후리가나 표시"
          description="한자 위에 읽는 법(가나)을 함께 보여줘요"
          value={furiganaEnabled}
          onChange={toggleFurigana}
          border
        />
      </View>

      <Text className="mb-3 mt-6 text-sm font-bold text-text-secondary">음성 재생 속도</Text>
      <View className="flex-row gap-2">
        {SPEECH_RATES.map((rate) => (
          <SpeedOption
            key={rate}
            rate={rate}
            selected={speechRate === rate}
            onPress={() => setSpeechRate(rate)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SpeedOption({
  rate,
  selected,
  onPress,
}: {
  rate: SpeechRate;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-card py-3 active:scale-[0.98]"
      style={{
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
    >
      <Text
        className="text-base font-bold"
        style={{ color: selected ? colors.surface : colors.textPrimary }}
      >
        {rate.toFixed(1)}x
      </Text>
    </Pressable>
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
