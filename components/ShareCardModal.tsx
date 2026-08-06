import { useRef, useState } from "react";
import { Modal, View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PillButton } from "@/components/PillButton";
import { ShareCard, type ShareCardStat } from "@/components/ShareCard";
import { captureAndShare } from "@/utils/shareCapture";
import { shareCardThemes } from "@/constants/shareCardThemes";
import { colors } from "@/constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  headline: string;
  stats: ShareCardStat[];
  dateLabel: string;
  fileName?: string;
};

export function ShareCardModal({
  visible,
  onClose,
  nickname,
  headline,
  stats,
  dateLabel,
  fileName = "onebite-share",
}: Props) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);

  if (!visible) return null;

  const theme = shareCardThemes[themeIndex];

  const handleShare = async () => {
    setSharing(true);
    try {
      await captureAndShare(cardRef, fileName);
    } catch (error: any) {
      Alert.alert("공유 실패", error.message ?? "다시 시도해주세요.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(24,29,47,0.55)" }}
      >
        <ShareCard
          ref={cardRef}
          nickname={nickname}
          headline={headline}
          stats={stats}
          dateLabel={dateLabel}
          theme={theme}
        />

        <View className="mt-5 flex-row gap-3">
          {shareCardThemes.map((t, index) => {
            const isSelected = index === themeIndex;
            return (
              <Pressable
                key={t.key}
                onPress={() => setThemeIndex(index)}
                hitSlop={8}
                className="items-center justify-center rounded-pill"
                style={{
                  width: 34,
                  height: 34,
                  backgroundColor: t.swatch,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : "rgba(255,255,255,0.6)",
                }}
              >
                {isSelected ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={t.key === "night" ? "#FFFFFF" : colors.textPrimary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
          {theme.label} 테마
        </Text>

        <View className="mt-6 w-full max-w-sm gap-3">
          <PillButton
            label="공유하기"
            icon="share-outline"
            loading={sharing}
            onPress={handleShare}
          />
          <PillButton label="닫기" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
