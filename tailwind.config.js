/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6573F0", soft: "#7D85FA" },
        text: { primary: "#181D2F", secondary: "#999CA3" },
        background: "#F8F8F8",
        surface: "#FFFFFF",
        border: "#E8EDE9",
        success: { DEFAULT: "#4ADE80", soft: "#E6FAD6" },
        danger: { DEFAULT: "#FB7185", soft: "#FCE0DA" },
        pastel: {
          cyan: { DEFAULT: "#ABEFFA", light: "#E1FAFD" },
          lime: { DEFAULT: "#DCFCBD", light: "#F4FEE9" },
          peach: { DEFAULT: "#F9DBD0", light: "#FDF1E9" },
          pink: { DEFAULT: "#FAD3F5", light: "#FFF2FC" },
          amber: { DEFAULT: "#FFE7C5", light: "#FFF7EC" },
        },
      },
      borderRadius: {
        card: "24px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
