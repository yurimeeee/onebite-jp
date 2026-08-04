import { useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/authStore";
import { getWeeklyLeaderboard, getMyWeeklyStanding } from "@/services/leaderboard";
import type { LeaderboardEntry } from "@/types/leaderboard";

const RANK_COLORS = [colors.pastelAmber, colors.pastelCyan, colors.pastelPink];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStanding, setMyStanding] = useState<{ weeklyXP: number; rank: number | null } | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const [list, standing] = await Promise.all([
            getWeeklyLeaderboard(50),
            user?.uid ? getMyWeeklyStanding(user.uid) : Promise.resolve(null),
          ]);
          if (cancelled) return;
          setEntries(list);
          setMyStanding(standing);
        } catch {
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.uid])
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="주간 랭킹" subtitle="이번 주 전체 유저" />

      <View
        className="mt-6 flex-row items-center justify-between rounded-card p-5"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <View>
          <Text className="text-sm font-bold text-primary">내 순위</Text>
          <Text className="mt-1 text-2xl font-bold text-text-primary">
            {myStanding?.rank ? `${myStanding.rank}위` : "50위 밖"}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-bold text-primary">이번 주 XP</Text>
          <Text className="mt-1 text-2xl font-bold text-text-primary">
            {myStanding?.weeklyXP ?? 0}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="mt-16 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View className="mt-16 items-center">
          <Ionicons name="podium-outline" size={40} color={colors.textSecondary} />
          <Text className="mt-3 text-text-secondary">아직 이번 주 랭킹 데이터가 없어요</Text>
        </View>
      ) : (
        <View className="mt-6 gap-2">
          {entries.map((entry, i) => (
            <LeaderboardRow
              key={entry.uid}
              rank={i + 1}
              entry={entry}
              isMe={entry.uid === user?.uid}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function LeaderboardRow({
  rank,
  entry,
  isMe,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const medalColor = RANK_COLORS[rank - 1];

  return (
    <View
      className="flex-row items-center gap-3 rounded-card p-4"
      style={{
        backgroundColor: isMe ? colors.primaryLight : colors.surface,
        borderWidth: isMe ? 1.5 : 0,
        borderColor: colors.primary,
      }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-pill"
        style={{ backgroundColor: medalColor ?? colors.surface2 }}
      >
        <Text className="text-sm font-bold text-text-primary">{rank}</Text>
      </View>
      <Text className="flex-1 text-base font-semibold text-text-primary" numberOfLines={1}>
        {entry.nickname}
        {isMe ? " (나)" : ""}
      </Text>
      <Text className="text-base font-bold" style={{ color: colors.primary }}>
        {entry.weeklyXP} XP
      </Text>
    </View>
  );
}
