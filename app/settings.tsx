import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { SPEECH_RATES, useSettingsStore, type SpeechRate } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { getUserProfile, setNickname as saveNickname } from "@/services/profile";
import { PillButton } from "@/components/PillButton";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const furiganaEnabled = useSettingsStore((s) => s.furiganaEnabled);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleVibration = useSettingsStore((s) => s.toggleVibration);
  const toggleFurigana = useSettingsStore((s) => s.toggleFurigana);
  const setSpeechRate = useSettingsStore((s) => s.setSpeechRate);

  const [nickname, setNicknameInput] = useState("");
  const [savedNickname, setSavedNickname] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid)
      .then((profile) => {
        setNicknameInput(profile.nickname ?? "");
        setSavedNickname(profile.nickname);
      })
      .catch(() => {});
  }, [user?.uid]);

  const trimmedNickname = nickname.trim();
  const canSave =
    !!user?.uid && trimmedNickname.length > 0 && trimmedNickname.length <= 12 &&
    trimmedNickname !== (savedNickname ?? "");

  const handleSaveNickname = async () => {
    if (!user?.uid || !canSave) return;
    setSaving(true);
    try {
      await saveNickname(user.uid, trimmedNickname);
      setSavedNickname(trimmedNickname);
    } catch (error: any) {
      Alert.alert("저장 실패", error.message ?? "다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

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

      <Text className="mb-3 mt-8 text-sm font-bold text-text-secondary">닉네임</Text>
      <View className="rounded-card bg-surface p-4">
        <Text className="mb-3 text-xs text-text-secondary">
          주간 랭킹과 학습 인증 카드에 표시될 이름이에요 (최대 12자)
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-2xl px-4 py-3 text-base text-text-primary"
            style={{ backgroundColor: colors.surface2 }}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor={colors.textSecondary}
            value={nickname}
            onChangeText={setNicknameInput}
            maxLength={12}
          />
        </View>
        <View className="mt-3">
          <PillButton
            label="닉네임 저장"
            variant={canSave ? "primary" : "secondary"}
            disabled={!canSave}
            loading={saving}
            onPress={handleSaveNickname}
          />
        </View>
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
