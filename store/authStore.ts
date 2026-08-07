import { Platform } from "react-native";
import { create } from "zustand";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/services/firebase";
import { kakaoWebAuthorize } from "@/services/kakao";

let GoogleSignin: any = null;
if (Platform.OS !== "web") {
  try {
    GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
    GoogleSignin.configure({
      webClientId: "795524297087-spa3j7n8pjhgc6qhj66b4c39lbg1eid6.apps.googleusercontent.com",
    });
  } catch {
    // 네이티브 모듈 미설치 (Expo Go 등) — Firebase 웹 SDK 팝업으로 폴백
  }
}

let KakaoLoginNative: typeof import("@react-native-seoul/kakao-login") | null = null;
if (Platform.OS !== "web") {
  try {
    KakaoLoginNative = require("@react-native-seoul/kakao-login");
  } catch {
    // 네이티브 모듈 미설치 (Expo Go 등) — 카카오 로그인 버튼은 웹에서만 노출됨
  }
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

async function exchangeKakaoAuth(body: { accessToken: string } | { code: string; redirectUri: string }) {
  const res = await fetch(`${API_BASE_URL}/api/kakao-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error ?? "카카오 로그인 처리에 실패했습니다.");
  }
  const { customToken } = await res.json();
  await signInWithCustomToken(auth, customToken);
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  kakaoLogin: () => Promise<void>;
  kakaoLoginWithCode: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  signup: async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },

  googleLogin: async () => {
    if (GoogleSignin) {
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error("Google 로그인에서 토큰을 받지 못했습니다.");
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  },

  kakaoLogin: async () => {
    if (Platform.OS !== "web" && KakaoLoginNative) {
      const token = await KakaoLoginNative.login();
      await exchangeKakaoAuth({ accessToken: token.accessToken });
    } else if (Platform.OS === "web") {
      // 카카오계정 로그인 페이지로 전체 리다이렉트되며, /auth/kakao-callback 에서 로그인이 마무리된다.
      await kakaoWebAuthorize();
    } else {
      throw new Error("카카오 로그인을 사용할 수 없는 환경입니다.");
    }
  },

  kakaoLoginWithCode: async (code, redirectUri) => {
    await exchangeKakaoAuth({ code, redirectUri });
  },

  logout: async () => {
    await signOut(auth);
    if (Platform.OS !== "web" && GoogleSignin) {
      // 구글 토큰 폐기는 네트워크 호출이라 느릴 수 있어 화면 전환을 막지 않도록 백그라운드로 처리
      GoogleSignin.signOut().catch(() => {});
    }
    if (Platform.OS !== "web" && KakaoLoginNative) {
      KakaoLoginNative.logout().catch(() => {});
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
