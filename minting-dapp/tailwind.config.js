const colors = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  content: ["./src/**/*.tsx"],
  theme: {
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
    colors: {
      // transparent: "transparent",
      background: "#000000",
      popupsbg: colors.white,
      neutral: colors.slate,
      primarytxt: colors.white,
      secondarytxt: "#FFFFFF",
      error: colors.red,
      errortxt: colors.white,
      gray: {
        50: "#f9fafb",
        100: "#f0f1f3",
        200: "#d9dbdf",
        300: "#b7bbc2",
        400: "#8f959f",
        500: "#6e7582",
        600: "#555e6e",
        700: "#3e4859",
        800: "#283242",
        900: "#131f30",
      },
      primary: {
        50: "#fbfaf4",
        100: "#f9efbc",
        200: "#f2dc82",
        300: "#ddb750",
        400: "#c18c2b",
        500: "#a46d16",
        600: "#86530e",
        700: "#673f0d",
        800: "#462b0b",
        900: "#2f1b08",
      },
      secondary: {
        50: "#fff6f6",
        100: "#ffefef",
        200: "#f9d3d3",
        300: "#eaa6a6",
        400: "#e56d6d",
        500: "#d93c3e",
        600: "#bd0e0f",
        700: "#930705",
        800: "#680605",
        900: "#470201",
      },
      yellow: {
        50: "#faf9f1",
        100: "#f7efaf",
        200: "#ece06e",
        300: "#cfbe40",
        400: "#a19720",
        500: "#7e7a0f",
        600: "#64610a",
        700: "#4e490a",
        800: "#353209",
        900: "#251f07",
      },
    },
  },
  variants: {},
  plugins: [],
};
