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

export async function getDaysForLevel(level: Levels): Promise<number[]> {
  const snapshot = await getDocs(collection(db, "quizzes", level, "days"));
  return snapshot.docs
    .map((d) => d.data().day as number)
    .sort((a, b) => a - b);
}

export async function getWordsForDay(
  level: Levels,
  day: number
): Promise<Word[]> {
  const snapshot = await getDoc(
    doc(db, "quizzes", level, "days", `day${day}`)
  );
  if (!snapshot.exists()) return [];
  return snapshot.data().words as Word[];
}

export async function getFillInBlankQuizzes(
  level: Levels
): Promise<FillInBlankQuiz[]> {
  const snapshot = await getDocs(
    collection(db, "fill_in_the_blank_quizzes", level, "quizzes")
  );
  return snapshot.docs.map((d) => d.data() as FillInBlankQuiz);
}

export type HistoryEntry = {
  completed?: boolean;
  correct?: number;
  total?: number;
};

export async function getUserHistoryMap(
  uid: string
): Promise<Record<string, HistoryEntry>> {
  const snapshot = await getDocs(collection(db, "users", uid, "history"));
  const map: Record<string, HistoryEntry> = {};
  snapshot.docs.forEach((d) => {
    map[d.id] = d.data() as HistoryEntry;
  });
  return map;
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
}

export async function getLastStudy(
  uid: string
): Promise<UserLastStudyInfo | null> {
  const snapshot = await getDoc(doc(db, "users", uid, "last_study", "info"));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserLastStudyInfo;
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
  const snapshot = await getDocs(collection(db, "users", uid, "attendance"));
  return new Set(snapshot.docs.map((d) => d.id));
}

export async function checkInToday(uid: string): Promise<string> {
  const todayKey = formatDateKey(new Date());
  await setDoc(doc(db, "users", uid, "attendance", todayKey), {
    date: todayKey,
    timestamp: serverTimestamp(),
  });
  return todayKey;
}
