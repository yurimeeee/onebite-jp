# 원바이트 일본어 (One Bite Japanese)

매일 한 입씩 베어 먹듯 짧게 학습하는 일본어 단어 퀴즈 앱입니다. Expo + React Native로 작성되어 iOS/Android/Web에서 동일한 코드베이스로 동작합니다.

## 기술 스택

- [Expo](https://expo.dev) 54 / [Expo Router](https://docs.expo.dev/router/introduction/) (파일 기반 라우팅)
- React Native 0.81 + [react-native-web](https://necolas.github.io/react-native-web/) (웹 지원)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for RN)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Zustand](https://zustand-demo.pmnd.rs/) (상태 관리)
- TypeScript

## 시작하기

```bash
pnpm install
```

`.env`에 Firebase 프로젝트 설정을 채워주세요 (`services/firebase.ts` 참고):

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_KAKAO_JS_KEY=
EXPO_PUBLIC_API_BASE_URL=
```

카카오 로그인은 Firebase에 내장된 제공자가 아니라 `api/kakao-auth.ts`(Vercel Function)가 카카오 액세스 토큰을 Firebase 커스텀 토큰으로 교환합니다. 이 함수는 Firebase Admin SDK 서비스 계정 키가 필요합니다.

```
FIREBASE_SERVICE_ACCOUNT_KEY=
```

- `EXPO_PUBLIC_KAKAO_JS_KEY`: 카카오 개발자센터 앱의 JavaScript 키 (웹 로그인용)
- `EXPO_PUBLIC_API_BASE_URL`: 네이티브(iOS/Android) 앱이 `/api/kakao-auth`를 호출할 배포 도메인 (예: `https://onebite-jp.vercel.app`). 웹에서는 상대 경로로 호출되므로 비워둬도 됩니다.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > "새 비공개 키 생성"으로 받은 JSON을 한 줄 문자열로 저장 (Vercel 프로젝트 환경변수에 등록, 로컬 `.env`에는 넣지 않아도 됨)

`app.json`의 `@react-native-seoul/kakao-login` 플러그인 설정에 카카오 **네이티브 앱 키**(JS 키와 다름)를 채워야 iOS/Android 빌드가 동작합니다.

개발 서버 실행:

```bash
pnpm start        # Expo 개발 서버 (QR 코드로 Expo Go 접속)
pnpm ios          # iOS 시뮬레이터
pnpm android      # Android 에뮬레이터
pnpm web          # 웹 브라우저
```

웹 프로덕션 빌드:

```bash
pnpm build        # dist/ 에 정적 웹 빌드 출력 (Vercel 배포용, vercel.json 참고)
```

## 폴더 구조

```
app/                 Expo Router 화면 (파일 = 라우트)
  (tabs)/            하단 탭: 학습(index) / 출석 / 마이페이지
  learn/             레벨 선택, Day별 학습
  quiz/              단어/빈칸/리스닝 퀴즈, 결과, 오답노트, 저장한 단어
  modes/             서브 학습 모드 (스와이프, 라디오, 타임어택)
api/                 Vercel Functions (카카오 로그인 토큰 교환)
components/          재사용 UI 컴포넌트
services/            Firebase, 퀴즈/업적/프로필/랭킹 데이터 로직
store/               Zustand 전역 상태 (인증, 목표, 알림, 오답, 저장 단어 등)
constants/           테마, 레벨, 업적, 목표 등 정적 데이터
types/               공용 TypeScript 타입
```

## 주요 기능

- 이메일 / Google / 카카오 로그인
- 레벨(JLPT N5~N2)·Day 단위 학습 진행 및 퀴즈 (단어 / 빈칸 채우기 / 리스닝)
- 서브 학습 모드: 뇌 빼고 단어 넘기기(스와이프), 출퇴근 라디오, 5초 타임어택
- 출석 체크, 연속 학습(스트릭), 학습 목표 설정 및 리마인더 알림
- 오답노트, 단어 저장(북마크)
- 업적(뱃지) 시스템, 주간 랭킹, 테마를 고를 수 있는 학습 인증 카드 공유
- 후리가나 토글, 음성 재생 속도 조절
- 도움말(자주 묻는 질문)
