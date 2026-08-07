declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js";

let loadPromise: Promise<void> | null = null;

export function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("웹 환경에서만 사용할 수 있습니다."));
  }
  if (!KAKAO_JS_KEY) {
    return Promise.reject(new Error("EXPO_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다."));
  }
  if (window.Kakao?.isInitialized?.()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const init = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      resolve();
    };

    const existing = document.getElementById("kakao-sdk") as HTMLScriptElement | null;
    if (existing) {
      if (window.Kakao) init();
      else existing.addEventListener("load", init, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = KAKAO_SDK_SRC;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => reject(new Error("카카오 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function kakaoRedirectUri(): string {
  return `${window.location.origin}/auth/kakao-callback`;
}

// Kakao JS SDK의 Auth.login()(토큰 직접 반환)은 더 이상 제공되지 않아,
// 인가 코드를 리다이렉트로 받아 백엔드에서 토큰과 교환하는 방식만 지원한다.
// https://kauth.kakao.com 으로 전체 페이지 이동이 발생하므로 이 함수는 반환되지 않는다.
export async function kakaoWebAuthorize(): Promise<void> {
  await loadKakaoSdk();
  window.Kakao.Auth.authorize({ redirectUri: kakaoRedirectUri() });
}
