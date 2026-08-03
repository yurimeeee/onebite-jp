import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { colors } from "@/constants/theme";
import { auth } from "@/services/firebase";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useWrongAnswerStore } from "@/store/wrongAnswerStore";

function useProtectedRoute() {
  const segments = useSegments() as string[];
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments.length === 0 || segments[0] === "signup";

    if (!user && !inAuthGroup) {
      router.replace("/");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);
}

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    useSettingsStore.getState().hydrate();
    useWrongAnswerStore.getState().hydrate();
    return unsubscribe;
  }, []);

  useProtectedRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {/* 웹 데스크톱: 중앙 모바일 프레임으로 정렬, 네이티브: 그대로 전체 화면 */}
        <View className="flex-1 items-center justify-center bg-background">
          <View className="w-full max-w-md flex-1 overflow-hidden bg-background web:min-h-screen web:shadow-sm web:border-x web:border-border/50">
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="learn/level" />
              <Stack.Screen name="learn/day" />
              <Stack.Screen name="quiz/word" />
              <Stack.Screen name="quiz/blank" />
              <Stack.Screen name="quiz/review" />
              <Stack.Screen
                name="quiz/result"
                options={{ animation: "fade", gestureEnabled: false }}
              />
            </Stack>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
