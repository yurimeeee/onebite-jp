import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/ScreenHeader";

const FAQS: { q: string; a: string }[] = [
  {
    q: "학습 모드에는 어떤 게 있나요?",
    a: "홈 화면 상단 탭에서 메인 학습(단어 퀴즈, 빈칸 채우기, 리스닝 퀴즈)과 서브 학습(뇌 빼고 단어 넘기기, 출퇴근 라디오, 5초 타임어택)을 전환할 수 있어요. 원하는 방식으로 골라서 학습해보세요.",
  },
  {
    q: "출석 스트릭은 어떻게 쌓이나요?",
    a: "출석 탭에서 '오늘 출석하기'를 누르면 하루씩 쌓여요. 하루라도 놓치면 스트릭이 끊기니, 알림 설정에서 '스트릭 경고'를 켜두면 끊기기 전에 알려드려요.",
  },
  {
    q: "오답노트는 뭔가요?",
    a: "퀴즈에서 틀린 문제가 자동으로 오답노트에 쌓여요. 마이페이지 > 오답노트에서 다시 풀어 맞히면 목록에서 사라지고, 또 틀리면 다시 쌓여요.",
  },
  {
    q: "저장한 단어는 어떻게 쓰나요?",
    a: "단어 퀴즈 카드에서 북마크 아이콘을 누르면 저장돼요. 마이페이지 > 저장한 단어에서 모아보고 발음도 다시 들을 수 있어요.",
  },
  {
    q: "업적(뱃지)은 어떻게 얻나요?",
    a: "학습 진도, 출석, 오답 정복, 컬렉션 등 다양한 조건을 달성하면 자동으로 잠금 해제돼요. 마이페이지 > 업적에서 전체 목록과 달성 조건을 확인할 수 있어요.",
  },
  {
    q: "주간 랭킹은 무엇을 기준으로 매겨지나요?",
    a: "이번 주에 쌓은 학습 경험치(XP)를 기준으로 전체 유저 순위를 보여줘요. 매주 초기화되니 이번 주도 열심히 쌓아보세요.",
  },
  {
    q: "학습 목표는 나중에 바꿀 수 있나요?",
    a: "네, 언제든 바꿀 수 있어요. 마이페이지 > 학습 목표 변경에서 라이트(3분) / 스탠다드(5분) / 하드코어(10분) 중 다시 고르면 돼요.",
  },
  {
    q: "알림이 안 와요",
    a: "마이페이지 > 알림 설정에서 학습 리마인더와 스트릭 경고를 각각 켜고 시간을 지정해주세요. 기기 알림 권한이 꺼져있으면 알림이 오지 않으니, 알림을 켰는데도 안 온다면 기기 설정에서 원바이트의 알림 권한을 확인해주세요. (모바일 앱에서만 지원돼요)",
  },
  {
    q: "후리가나나 소리가 안 나와요",
    a: "마이페이지 > 환경 설정에서 후리가나 표시, 사운드 효과음, 음성 재생 속도를 각각 켜고 끄거나 조절할 수 있어요.",
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="도움말" subtitle="자주 묻는 질문" />

      <View className="mt-6 gap-3">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <View key={item.q} className="overflow-hidden rounded-card bg-surface">
              <Pressable
                onPress={() => setOpenIndex(open ? null : i)}
                className="flex-row items-center gap-3 px-5 py-4 active:opacity-70"
              >
                <View
                  className="h-8 w-8 items-center justify-center rounded-pill"
                  style={{ backgroundColor: colors.pastelCyanLight }}
                >
                  <Ionicons name="help" size={16} color={colors.primary} />
                </View>
                <Text className="flex-1 text-base font-semibold text-text-primary">
                  {item.q}
                </Text>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
              {open ? (
                <View
                  className="px-5 pb-4"
                  style={{ paddingLeft: 20 + 32 + 12 }}
                >
                  <Text className="text-sm leading-5 text-text-secondary">{item.a}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View
        className="mt-6 items-center rounded-card p-5"
        style={{ backgroundColor: colors.pastelPeachLight }}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.textPrimary} />
        <Text className="mt-2 text-center text-sm text-text-secondary">
          찾는 답이 없다면{"\n"}궁금한 점을 알려주세요, 계속 채워나갈게요
        </Text>
      </View>
    </ScrollView>
  );
}
