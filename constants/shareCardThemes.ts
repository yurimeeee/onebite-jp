import { colors } from "@/constants/theme";

export type ShareCardTheme = {
  key: string;
  label: string;
  cardBg: string;
  blob1: string;
  blob2: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  statBg: string;
  swatch: string;
};

export const shareCardThemes: ShareCardTheme[] = [
  {
    key: "pink",
    label: "핑크",
    cardBg: colors.pastelPinkLight,
    blob1: colors.pastelCyan,
    blob2: colors.pastelAmber,
    accent: colors.primary,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    statBg: "rgba(255,255,255,0.72)",
    swatch: colors.pastelPink,
  },
  {
    key: "cyan",
    label: "시안",
    cardBg: colors.pastelCyanLight,
    blob1: colors.pastelLime,
    blob2: colors.pastelPink,
    accent: colors.primary,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    statBg: "rgba(255,255,255,0.72)",
    swatch: colors.pastelCyan,
  },
  {
    key: "lime",
    label: "라임",
    cardBg: colors.pastelLimeLight,
    blob1: colors.pastelAmber,
    blob2: colors.pastelCyan,
    accent: colors.primary,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    statBg: "rgba(255,255,255,0.72)",
    swatch: colors.pastelLime,
  },
  {
    key: "amber",
    label: "앰버",
    cardBg: colors.pastelAmberLight,
    blob1: colors.pastelPink,
    blob2: colors.pastelLime,
    accent: colors.primary,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    statBg: "rgba(255,255,255,0.72)",
    swatch: colors.pastelAmber,
  },
  {
    key: "night",
    label: "다크",
    cardBg: "#181D2F",
    blob1: "rgba(101,115,240,0.45)",
    blob2: "rgba(171,239,250,0.25)",
    accent: "#ABEFFA",
    textPrimary: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.65)",
    statBg: "rgba(255,255,255,0.12)",
    swatch: "#181D2F",
  },
];
