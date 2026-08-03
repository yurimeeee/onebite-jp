import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, Alert, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors } from "@/constants/theme";
import { useNotificationStore } from "@/store/notificationStore";

function formatTime(hour: number, minute: number) {
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}시${minute ? ` ${minute}분` : ""}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enabled = useNotificationStore((s) => s.enabled);
  const hour = useNotificationStore((s) => s.hour);
  const minute = useNotificationStore((s) => s.minute);
  const supported = useNotificationStore((s) => s.supported);
  const setEnabled = useNotificationStore((s) => s.setEnabled);
  const setTime = useNotificationStore((s) => s.setTime);
  const [busy, setBusy] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(hour);
  const [pickerMinute, setPickerMinute] = useState(minute);

  useEffect(() => {
    setPickerHour(hour);
    setPickerMinute(minute);
  }, [hour, minute]);

  useEffect(() => {
    if (pickerHour === hour && pickerMinute === minute) return;
    const timer = setTimeout(() => setTime(pickerHour, pickerMinute), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerHour, pickerMinute]);

  const timeValue = useMemo(() => {
    const d = new Date();
    d.setHours(pickerHour, pickerMinute, 0, 0);
    return d;
  }, [pickerHour, pickerMinute]);

  const onToggle = async (next: boolean) => {
    if (!supported) {
      Alert.alert("모바일 앱에서 이용해주세요", "학습 알림은 iOS/Android 앱에서만 지원돼요.");
      return;
    }
    setBusy(true);
    const ok = await setEnabled(next);
    setBusy(false);
    if (next && !ok) {
      Alert.alert(
        "알림 권한이 필요해요",
        "기기 설정에서 원바이트의 알림 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "설정으로 이동",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowAndroidPicker(false);
    if (event.type === "dismissed" || !selected) return;
    setPickerHour(selected.getHours());
    setPickerMinute(selected.getMinutes());
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
        <Text className="text-2xl font-bold text-text-primary">알림 설정</Text>
      </View>

      <View className="mt-8 overflow-hidden rounded-card bg-surface">
        <View className="flex-row items-center gap-3 px-5 py-4">
          <View
            className="h-10 w-10 items-center justify-center rounded-pill"
            style={{ backgroundColor: colors.pastelPeachLight }}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text-primary">학습 리마인더</Text>
            <Text className="mt-0.5 text-xs text-text-secondary">
              {supported
                ? "매일 정해진 시간에 학습 알림을 보내드려요"
                : "모바일 앱에서만 지원돼요"}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={busy || !supported}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {enabled ? (
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text-secondary">
            알림 시간 · {formatTime(pickerHour, pickerMinute)}
          </Text>

          {Platform.OS === "ios" ? (
            <View className="items-center overflow-hidden rounded-card bg-surface py-2">
              <DateTimePicker
                value={timeValue}
                mode="time"
                display="spinner"
                onChange={onChangeTime}
                themeVariant="light"
                locale="ko-KR"
              />
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => setShowAndroidPicker(true)}
                className="flex-row items-center justify-between rounded-card bg-surface px-5 py-4 active:opacity-70"
                style={{ borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-base font-semibold text-text-primary">시간 변경</Text>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              </Pressable>
              {showAndroidPicker ? (
                <DateTimePicker
                  value={timeValue}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}
