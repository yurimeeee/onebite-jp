import type { Timestamp } from "firebase/firestore";
import type { Levels } from "@/types/quiz";

export interface UserLastStudyInfo {
  last_study_day: number;
  last_study_level: Levels;
  last_updated: Timestamp;
}
