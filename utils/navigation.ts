import type { Router } from "expo-router";

/** router.back()이지만 돌아갈 화면이 없으면(딥링크 진입, 리로드 등) fallback으로 이동한다. */
export function safeBack(router: Router, fallback: string = "/(tabs)") {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
}
