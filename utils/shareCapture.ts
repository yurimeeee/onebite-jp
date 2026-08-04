import type { RefObject } from "react";
import { Platform, type View } from "react-native";

let captureRef: any = null;
let Sharing: any = null;
if (Platform.OS !== "web") {
  try {
    captureRef = require("react-native-view-shot").captureRef;
    Sharing = require("expo-sharing");
  } catch {
    // 네이티브 모듈 미설치 환경 (Expo Go 등) — 캡처/공유 기능 비활성화
  }
}

let toPng: any = null;
if (Platform.OS === "web") {
  try {
    toPng = require("html-to-image").toPng;
  } catch {
    // html-to-image 미설치 — 웹 캡처 비활성화
  }
}

/** 뷰를 이미지로 캡처해 공유 시트(네이티브) 또는 Web Share API/다운로드(웹)로 내보낸다. */
export async function captureAndShare(
  ref: RefObject<View | null>,
  fileName: string
): Promise<void> {
  if (Platform.OS === "web") {
    await captureAndShareWeb(ref, fileName);
  } else {
    await captureAndShareNative(ref, fileName);
  }
}

async function captureAndShareNative(ref: RefObject<View | null>, fileName: string) {
  if (!captureRef) throw new Error("캡처 기능을 사용할 수 없어요.");
  const uri: string = await captureRef(ref, { format: "png", quality: 1 });
  if (Sharing && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: fileName });
  } else {
    throw new Error("이 기기에서는 공유 기능을 사용할 수 없어요.");
  }
}

async function captureAndShareWeb(ref: RefObject<View | null>, fileName: string) {
  if (!toPng) throw new Error("캡처 기능을 사용할 수 없어요.");
  const node = ref.current as unknown as HTMLElement | null;
  if (!node) throw new Error("캡처할 화면을 찾지 못했어요.");

  const dataUrl: string = await toPng(node, { pixelRatio: 2 });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
  };

  if (nav.share && nav.canShare) {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${fileName}.png`, { type: "image/png" });
    if (nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: fileName });
      return;
    }
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
