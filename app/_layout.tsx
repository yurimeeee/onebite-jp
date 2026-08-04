import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { colors } from "@/constants/theme";
import { auth } from "@/services/firebase";
import { formatDateKey, getAttendance } from "@/services/quiz";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";
import { useSavedWordsStore } from "@/store/savedWordsStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAchievementStore } from "@/store/achievementStore";
import { useGoalStore } from "@/store/goalStore";

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const dailyGoal = useGoalStore((s) => s.dailyGoal);
  const goalKnown = useGoalStore((s) => s.known);
  // 로그인은 했지만 아직 학습 목표를 고르지 않은 유저 (신규가입 여부와 무관하게 항상 체크한다)
  const needsGoal = !!user && goalKnown && !dailyGoal;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        getAttendance(firebaseUser.uid)
          .then((attended) => {
            useNotificationStore
              .getState()
              .syncStreakWarningForToday(attended.has(formatDateKey(new Date())));
          })
          .catch(() => {});
        useGoalStore.getState().hydrate(firebaseUser.uid);
      } else {
        useGoalStore.getState().reset();
      }
    });
    useSettingsStore.getState().hydrate();
    useWrongAnswerStore.getState().hydrate();
    useSavedWordsStore.getState().hydrate();
    useNotificationStore.getState().hydrate();
    useAchievementStore.getState().hydrate();
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {/* 웹 데스크톱: 중앙 모바일 프레임으로 정렬, 네이티브: 그대로 전체 화면 */}
        <View className="flex-1 items-center justify-center bg-background">
          <View className="w-full max-w-md flex-1 overflow-hidden bg-background web:shadow-sm web:border-x web:border-border/50">
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: "slide_from_right",
              }}
            >
              <Stack.Protected guard={!authLoading && !user}>
                <Stack.Screen name="index" />
                <Stack.Screen name="signup" />
              </Stack.Protected>

              <Stack.Protected guard={!authLoading && !!user && needsGoal}>
                <Stack.Screen name="goal" />
              </Stack.Protected>

              <Stack.Protected guard={!authLoading && !!user && !needsGoal}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="leaderboard" />
                <Stack.Screen name="learn/level" />
                <Stack.Screen name="learn/day" />
                <Stack.Screen name="quiz/word" />
                <Stack.Screen name="quiz/blank" />
                <Stack.Screen name="quiz/listen" />
                <Stack.Screen name="quiz/review" />
                <Stack.Screen name="quiz/saved" />
                <Stack.Screen name="modes/swipe" />
                <Stack.Screen name="modes/radio" />
                <Stack.Screen name="modes/timeattack" />
                <Stack.Screen
                  name="quiz/result"
                  options={{ animation: "fade", gestureEnabled: false }}
                />
              </Stack.Protected>
            </Stack>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
