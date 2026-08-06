import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { PillButton } from "@/components/PillButton";
import { safeBack } from "@/utils/navigation";
import { useAuthStore } from "@/store/authStore";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signup = useAuthStore((s) => s.signup);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password);
    } catch (error: any) {
      Alert.alert("회원가입 실패", error.message ?? "다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => safeBack(router, "/")}
        hitSlop={12}
        className="mb-4 h-10 w-10 items-center justify-center rounded-pill bg-surface"
        style={{ borderWidth: 1, borderColor: colors.border }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="text-3xl font-bold text-text-primary">회원가입</Text>
      <Text className="mt-2 text-sm text-text-secondary">
        3초 만에 가입하고 학습을 시작해보세요
      </Text>

      <View className="mt-8 gap-3">
        <TextInput
          className="rounded-2xl px-5 py-4 text-base text-text-primary"
          style={{ backgroundColor: colors.surface2 }}
          placeholder="이메일"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View className="flex-row items-center rounded-2xl px-5" style={{ backgroundColor: colors.surface2 }}>
          <TextInput
            className="flex-1 py-4 text-base text-text-primary"
            placeholder="비밀번호 (6자 이상)"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl px-5" style={{ backgroundColor: colors.surface2 }}>
          <TextInput
            className="flex-1 py-4 text-base text-text-primary"
            placeholder="비밀번호 확인"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <Pressable onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <View className="mt-2">
          <PillButton label="회원가입" onPress={handleSignup} loading={loading} />
        </View>

        <View className="mt-2 flex-row justify-center gap-1">
          <Text className="text-sm text-text-secondary">이미 계정이 있으신가요?</Text>
          <Pressable onPress={() => safeBack(router, "/")}>
            <Text className="text-sm font-bold text-primary">로그인</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
