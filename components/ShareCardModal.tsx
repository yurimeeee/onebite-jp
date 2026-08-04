import { useRef, useState } from "react";
import { Modal, View, Alert } from "react-native";
import { PillButton } from "@/components/PillButton";
import { ShareCard, type ShareCardStat } from "@/components/ShareCard";
import { captureAndShare } from "@/utils/shareCapture";

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

  if (!visible) return null;

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
        />

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
