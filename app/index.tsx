import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/theme';
import { PillButton } from '@/components/PillButton';
import { useAuthStore } from '@/store/authStore';

const SAVED_EMAIL_KEY = 'saved_email';
const REMEMBER_EMAIL_KEY = 'remember_email';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const kakaoLogin = useAuthStore((s) => s.kakaoLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const remember = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (remember === 'true') {
          setRememberEmail(true);
          const saved = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
          if (saved) setEmail(saved);
        }
      } catch {}
    })();
  }, []);

  const saveEmailPreference = async (emailToSave: string) => {
    try {
      if (rememberEmail) {
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, emailToSave);
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {}
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await saveEmailPreference(email);
      await login(email, password);
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message ?? '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
    } catch (error: any) {
      Alert.alert('Google 로그인 실패', error.message ?? '다시 시도해주세요.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    try {
      await kakaoLogin();
    } catch (error: any) {
      Alert.alert('카카오 로그인 실패', error.message ?? '다시 시도해주세요.');
    } finally {
      setKakaoLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 히어로 */}
      <View className="items-center py-6">
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 56, height: 56 }}
          resizeMode="contain"
        />
        <Text className="mt-4 text-3xl font-bold text-text-primary">원바이트</Text>
        <Text className="mt-2 text-sm leading-5 text-center text-text-secondary">매일 1분, 부담 없이 시작하는 하루 습관</Text>
      </View>

      {/* 로그인 폼 */}
      <View className="gap-3 mt-4">
        <TextInput
          className="px-5 py-4 text-base rounded-2xl text-text-primary"
          style={{ backgroundColor: colors.surface2 }}
          placeholder="이메일"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View className="flex-row items-center px-5 rounded-2xl" style={{ backgroundColor: '#F6F6F6' }}>
          <TextInput
            className="flex-1 py-4 text-base text-text-primary"
            placeholder="비밀번호"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Pressable className="flex-row items-center gap-2 py-1" onPress={() => setRememberEmail((v) => !v)}>
          <View
            className="items-center justify-center w-5 h-5 rounded-md"
            style={{
              backgroundColor: rememberEmail ? colors.primary : '#F6F6F6',
              borderWidth: rememberEmail ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            {rememberEmail ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
          </View>
          <Text className="text-sm text-text-secondary">이메일 저장</Text>
        </Pressable>

        <PillButton
          label="로그인"
          onPress={handleLogin}
          loading={loading}
          // icon="arrow-forward"
        />

        <View className="flex-row items-center gap-3 my-1">
          <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
          <Text className="text-xs text-text-secondary">또는</Text>
          <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          className="flex-row items-center justify-center gap-3 rounded-pill border-2 border-border bg-surface py-4 active:scale-[0.98]"
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text className="text-base font-bold text-text-primary">Google로 계속하기</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleKakaoLogin}
          disabled={kakaoLoading}
          className="flex-row items-center justify-center gap-3 rounded-pill py-4 active:scale-[0.98]"
          style={{ backgroundColor: '#FEE500' }}
        >
          {kakaoLoading ? (
            <ActivityIndicator color="#191919" />
          ) : (
            <>
              <Ionicons name="chatbubble" size={18} color="#191919" />
              <Text className="text-base font-bold" style={{ color: '#191919' }}>
                카카오로 계속하기
              </Text>
            </>
          )}
        </Pressable>

        <View className="flex-row justify-center gap-1 mt-2">
          <Text className="text-sm text-text-secondary">계정이 없으신가요?</Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text className="text-sm font-bold text-primary">회원가입</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
