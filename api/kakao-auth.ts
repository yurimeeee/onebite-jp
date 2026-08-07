import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdmin() {
  if (getApps().length) return getApps()[0]!;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.");

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

async function exchangeCodeForAccessToken(code: string, redirectUri: string): Promise<string> {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) throw new Error("KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.");

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
  });
  if (process.env.KAKAO_CLIENT_SECRET) {
    params.set("client_secret", process.env.KAKAO_CLIENT_SECRET);
  }

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenBody.error_description ?? "카카오 인가 코드 교환에 실패했습니다.");
  }
  return tokenBody.access_token as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { accessToken: bodyAccessToken, code, redirectUri } = req.body ?? {};

  try {
    const accessToken =
      typeof bodyAccessToken === "string"
        ? bodyAccessToken
        : typeof code === "string" && typeof redirectUri === "string"
          ? await exchangeCodeForAccessToken(code, redirectUri)
          : null;

    if (!accessToken) {
      res.status(400).json({ error: "accessToken 또는 (code, redirectUri)가 필요합니다." });
      return;
    }

    const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!kakaoRes.ok) {
      res.status(401).json({ error: "유효하지 않은 카카오 액세스 토큰입니다." });
      return;
    }

    const kakaoUser = (await kakaoRes.json()) as KakaoUserResponse;
    const uid = `kakao:${kakaoUser.id}`;
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname;
    // 카카오는 http:// 로 내려주는 경우가 있어 https 페이지에서 mixed-content로 막히므로 보정한다.
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url?.replace(/^http:/, "https:");

    getFirebaseAdmin();
    const auth = getAuth();

    await auth.updateUser(uid, {
      ...(email ? { email } : {}),
      ...(nickname ? { displayName: nickname } : {}),
      ...(photoURL ? { photoURL } : {}),
    }).catch(async (error: any) => {
      if (error.code === "auth/user-not-found") {
        await auth.createUser({
          uid,
          ...(email ? { email } : {}),
          ...(nickname ? { displayName: nickname } : {}),
          ...(photoURL ? { photoURL } : {}),
        });
      } else {
        throw error;
      }
    });

    const customToken = await auth.createCustomToken(uid, { provider: "kakao" });
    res.status(200).json({ customToken });
  } catch (error: any) {
    console.error("[kakao-auth] failed", error);
    res.status(500).json({ error: error.message ?? "카카오 로그인 처리 중 오류가 발생했습니다." });
  }
}
