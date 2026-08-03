export const colors = {
  primary: "#6573F0",
  primarySoft: "#7D85FA",
  textPrimary: "#181D2F",
  textSecondary: "#999CA3",
  background: "#F8F8F8",
  surface: "#FFFFFF",
  surface2: "#F6F6F6",
  border: "#E8EDE9",
  success: "#4ADE80",
  successSoft: "#E6FAD6",
  danger: "#FB7185",
  dangerSoft: "#FCE0DA",
  pastelCyan: "#ABEFFA",
  pastelCyanLight: "#E1FAFD",
  pastelLime: "#DCFCBD",
  pastelLimeLight: "#F4FEE9",
  pastelPeach: "#F9DBD0",
  pastelPeachLight: "#FDF1E9",
  pastelPink: "#FAD3F5",
  pastelPinkLight: "#FFF2FC",
  pastelAmber: "#FFE7C5",
  pastelAmberLight: "#FFF7EC",
} as const;

export type LevelKey = "beginner" | "elementary" | "intermediate" | "advanced";

export const levels: {
  key: LevelKey;
  label: string;
  bg: string;
  chip: string;
}[] = [
  { key: "beginner", label: "입문", bg: colors.pastelLimeLight, chip: colors.pastelLime },
  { key: "elementary", label: "초급", bg: colors.pastelCyanLight, chip: colors.pastelCyan },
  { key: "intermediate", label: "중급", bg: colors.pastelAmberLight, chip: colors.pastelAmber },
  { key: "advanced", label: "고급", bg: colors.pastelPinkLight, chip: colors.pastelPink },
];
