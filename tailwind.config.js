export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f7f6f0",
          100: "#eeebdc",
          200: "#dcd6ba",
          300: "#c7bd93",
          400: "#b7ac83",
          500: "#a49968",
          600: "#8a8055",
          700: "#6d6544",
          800: "#514c34",
          900: "#3a3626",
        },
        blush: {
          50: "#fdf4f2",
          100: "#fbe6e1",
          200: "#f6cac2",
          300: "#efa89c",
          400: "#e68a7a",
          500: "#d96f5c",
        },
        cream: "#fbf7ee",
        paw: "#e9ddc4",
      },
      fontFamily: {
        display: ['"Baloo 2"', "cursive", "system-ui", "sans-serif"],
        body: ['"Quicksand"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(90, 80, 50, 0.25)",
      },
      backgroundImage: {
        paws: "radial-gradient(circle at 1px 1px, rgba(180,166,120,0.18) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
