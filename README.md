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
```

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
components/          재사용 UI 컴포넌트
services/            Firebase, 퀴즈/업적/프로필/랭킹 데이터 로직
store/               Zustand 전역 상태 (인증, 목표, 알림, 오답, 저장 단어 등)
constants/           테마, 레벨, 업적, 목표 등 정적 데이터
types/               공용 TypeScript 타입
```

## 주요 기능

- 레벨(JLPT N5~N2)·Day 단위 학습 진행 및 퀴즈 (단어 / 빈칸 채우기 / 리스닝)
- 서브 학습 모드: 뇌 빼고 단어 넘기기(스와이프), 출퇴근 라디오, 5초 타임어택
- 출석 체크, 연속 학습(스트릭), 학습 목표 설정 및 리마인더 알림
- 오답노트, 단어 저장(북마크)
- 업적(뱃지) 시스템, 주간 랭킹, 학습 인증 카드 공유
- 후리가나 토글, 음성 재생 속도 조절
