import { Modal, View, Text } from "react-native";
import { colors } from "@/constants/theme";
import type { Badge } from "@/constants/achievements";
import { Confetti } from "@/components/Confetti";
import { IconBadge, PillButton } from "@/components/PillButton";

export function BadgeUnlockOverlay({
  badges,
  onClose,
}: {
  badges: Badge[];
  onClose: () => void;
}) {
  if (badges.length === 0) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(24,29,47,0.55)" }}
      >
        <Confetti />
        <View className="w-full max-w-sm items-center rounded-card bg-surface p-6">
          <Text className="text-sm font-bold text-primary">새 업적 달성!</Text>

          <View className="mt-4 w-full gap-3">
            {badges.map((badge) => (
              <View
                key={badge.id}
                className="flex-row items-center gap-3 rounded-2xl p-3"
                style={{ backgroundColor: colors.surface2 }}
              >
                <IconBadge icon={badge.icon} bg={badge.color} color={colors.textPrimary} size={44} />
                <View className="flex-1">
                  <Text className="text-base font-bold text-text-primary">{badge.title}</Text>
                  <Text className="mt-0.5 text-xs text-text-secondary">{badge.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mt-5 w-full">
            <PillButton label="확인" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
