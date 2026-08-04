import { forwardRef } from "react";
import { View, Text } from "react-native";
import { colors } from "@/constants/theme";

export type ShareCardStat = { label: string; value: string };

type Props = {
  nickname: string;
  headline: string;
  stats: ShareCardStat[];
  dateLabel: string;
};

/** 9:16 비율의 학습 인증 카드. captureAndShare가 이 뷰를 그대로 이미지로 캡처한다. */
export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { nickname, headline, stats, dateLabel },
  ref
) {
  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 320,
        height: 560,
        borderRadius: 32,
        backgroundColor: colors.pastelPinkLight,
        padding: 28,
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: colors.pastelCyan,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.pastelAmber,
          opacity: 0.5,
        }}
      />

      <View>
        <Text style={{ fontSize: 14, fontWeight: "800", color: colors.primary }}>
          원바이트 ONE BITE
        </Text>
        <Text
          style={{
            marginTop: 18,
            fontSize: 15,
            fontWeight: "700",
            color: colors.textSecondary,
          }}
        >
          {nickname}님
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 26,
            fontWeight: "800",
            color: colors.textPrimary,
            lineHeight: 34,
          }}
        >
          {headline}
        </Text>
      </View>

      <View style={{ gap: 14 }}>
        {stats.map((s) => (
          <View
            key={s.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.72)",
              paddingVertical: 14,
              paddingHorizontal: 18,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary }}>
              {s.label}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.textPrimary }}>
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: colors.textSecondary,
          textAlign: "right",
        }}
      >
        {dateLabel} · 매일 한입씩, 일본어
      </Text>
    </View>
  );
});
