import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/services/firebase";
import type { FillInBlankQuiz, Levels, Word } from "@/types/quiz";
import type { UserLastStudyInfo } from "@/types/user";
import { getCached, getCachedPersistent, invalidateCache } from "@/utils/cache";

// 퀴즈 콘텐츠(레벨/단어/빈칸문제)는 거의 바뀌지 않으므로 기기에 영속 캐시하고,
// 하루 단위로만 갱신해 콘텐츠 업데이트를 반영한다.
const CONTENT_TTL = 24 * 60 * 60 * 1000;
// 유저 진행 데이터는 학습/출석 후 곧바로 바뀔 수 있어 짧은 TTL만 두고,
// 실제 변경 지점(markDayCompleted, checkInToday)에서 캐시를 즉시 무효화한다.
const USER_TTL = 60 * 1000;

export async function getDaysForLevel(level: Levels): Promise<number[]> {
  return getCachedPersistent(
    `days:${level}`,
    async () => {
      const snapshot = await getDocs(collection(db, "quizzes", level, "days"));
      return snapshot.docs
        .map((d) => d.data().day as number)
        .sort((a, b) => a - b);
    },
    CONTENT_TTL
  );
}

export async function getWordsForDay(
  level: Levels,
  day: number
): Promise<Word[]> {
  return getCachedPersistent(
    `words:${level}:${day}`,
    async () => {
      const snapshot = await getDoc(
        doc(db, "quizzes", level, "days", `day${day}`)
      );
      if (!snapshot.exists()) return [];
      return snapshot.data().words as Word[];
    },
    CONTENT_TTL
  );
}

export async function getFillInBlankQuizzes(
  level: Levels
): Promise<FillInBlankQuiz[]> {
  return getCachedPersistent(
    `blank:${level}`,
    async () => {
      const snapshot = await getDocs(
        collection(db, "fill_in_the_blank_quizzes", level, "quizzes")
      );
      return snapshot.docs.map((d) => d.data() as FillInBlankQuiz);
    },
    CONTENT_TTL
  );
}

export type HistoryEntry = {
  completed?: boolean;
  correct?: number;
  total?: number;
};

export async function getUserHistoryMap(
  uid: string
): Promise<Record<string, HistoryEntry>> {
  return getCached(
    `history:${uid}`,
    async () => {
      const snapshot = await getDocs(collection(db, "users", uid, "history"));
      const map: Record<string, HistoryEntry> = {};
      snapshot.docs.forEach((d) => {
        map[d.id] = d.data() as HistoryEntry;
      });
      return map;
    },
    USER_TTL
  );
}

export async function markDayCompleted(
  uid: string,
  level: Levels,
  day: number,
  correct: number,
  total: number
): Promise<void> {
  const historyRef = doc(db, "users", uid, "history", `${level}_day${day}`);
  await setDoc(
    historyRef,
    {
      completed: true,
      correct,
      total,
      last_updated: serverTimestamp(),
    },
    { merge: true }
  );

  const lastStudyRef = doc(db, "users", uid, "last_study", "info");
  await setDoc(lastStudyRef, {
    last_updated: serverTimestamp(),
    last_study_level: level,
    last_study_day: day,
  });

  invalidateCache(`history:${uid}`);
  invalidateCache(`lastStudy:${uid}`);
}

export async function getLastStudy(
  uid: string
): Promise<UserLastStudyInfo | null> {
  return getCached(
    `lastStudy:${uid}`,
    async () => {
      const snapshot = await getDoc(
        doc(db, "users", uid, "last_study", "info")
      );
      if (!snapshot.exists()) return null;
      return snapshot.data() as UserLastStudyInfo;
    },
    USER_TTL
  );
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calcStreak(attended: Set<string>, today: Date): number {
  let streak = 0;
  const d = new Date(today);
  while (attended.has(formatDateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export async function getAttendance(uid: string): Promise<Set<string>> {
  return getCached(
    `attendance:${uid}`,
    async () => {
      const snapshot = await getDocs(
        collection(db, "users", uid, "attendance")
      );
      return new Set(snapshot.docs.map((d) => d.id));
    },
    USER_TTL
  );
}

export async function checkInToday(uid: string): Promise<string> {
  const todayKey = formatDateKey(new Date());
  await setDoc(doc(db, "users", uid, "attendance", todayKey), {
    date: todayKey,
    timestamp: serverTimestamp(),
  });
  invalidateCache(`attendance:${uid}`);
  return todayKey;
}
