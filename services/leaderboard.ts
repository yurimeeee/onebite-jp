import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";

import { db } from "@/services/firebase";
import { getUserProfile } from "@/services/profile";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { getCached, invalidateCache } from "@/utils/cache";
import { getISOWeekKey } from "@/utils/week";

const LEADERBOARD_TTL = 30 * 1000;

/** 이번 주 XP를 적립한다. 저장된 주차 키가 이번 주와 다르면 새로 리셋해서 시작한다. */
export async function awardWeeklyXP(uid: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  const weekKey = getISOWeekKey(new Date());
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    const data = snapshot.exists() ? snapshot.data() : null;
    const storedWeekKey = typeof data?.weeklyXPWeekKey === "string" ? data.weeklyXPWeekKey : null;
    const storedXP = typeof data?.weeklyXP === "number" ? data.weeklyXP : 0;
    const nextXP = storedWeekKey === weekKey ? storedXP + amount : amount;
    tx.set(ref, { weeklyXP: nextXP, weeklyXPWeekKey: weekKey }, { merge: true });
  });

  invalidateCache(`profile:${uid}`);
  invalidateCache("leaderboard");
}

export async function getWeeklyLeaderboard(limitCount = 50): Promise<LeaderboardEntry[]> {
  const weekKey = getISOWeekKey(new Date());
  return getCached(
    `leaderboard:${weekKey}:${limitCount}`,
    async () => {
      const q = query(
        collection(db, "users"),
        where("weeklyXPWeekKey", "==", weekKey),
        orderBy("weeklyXP", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          nickname:
            typeof data.nickname === "string" && data.nickname.trim()
              ? data.nickname
              : "학습자",
          weeklyXP: typeof data.weeklyXP === "number" ? data.weeklyXP : 0,
        } satisfies LeaderboardEntry;
      });
    },
    LEADERBOARD_TTL
  );
}

/** 상위 50위 안에서 내 순위를 찾는다. 없으면 rank: null (50위 밖)을 반환한다. */
export async function getMyWeeklyStanding(
  uid: string
): Promise<{ weeklyXP: number; rank: number | null }> {
  const [entries, profile] = await Promise.all([getWeeklyLeaderboard(50), getUserProfile(uid)]);
  const weekKey = getISOWeekKey(new Date());
  const weeklyXP = profile.weeklyXPWeekKey === weekKey ? profile.weeklyXP : 0;
  const index = entries.findIndex((e) => e.uid === uid);
  return { weeklyXP, rank: index >= 0 ? index + 1 : null };
}
