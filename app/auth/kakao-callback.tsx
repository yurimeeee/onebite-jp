import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { kakaoRedirectUri } from "@/services/kakao";
import { useAuthStore } from "@/store/authStore";

export default function KakaoCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const kakaoLoginWithCode = useAuthStore((s) => s.kakaoLoginWithCode);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (params.error) {
      setError(params.error_description ?? "카카오 로그인이 취소되었습니다.");
      return;
    }
    if (!params.code) {
      setError("잘못된 접근입니다.");
      return;
    }

    kakaoLoginWithCode(params.code, kakaoRedirectUri())
      .then(() => router.replace("/"))
      .catch((e: any) => setError(e.message ?? "카카오 로그인 처리에 실패했습니다."));
  }, [params.code, params.error, params.error_description, kakaoLoginWithCode, router]);

  return (
    <View className="items-center justify-center flex-1 gap-4 px-6 bg-background">
      {error ? (
        <>
          <Text className="text-base font-bold text-center text-text-primary">{error}</Text>
          <Pressable onPress={() => router.replace("/")}>
            <Text className="text-sm font-bold text-primary">로그인 화면으로 돌아가기</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primary} />
          <Text className="text-sm text-text-secondary">카카오 로그인 처리 중...</Text>
        </>
      )}
    </View>
  );
}
