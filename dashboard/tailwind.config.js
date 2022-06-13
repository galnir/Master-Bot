module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  mode: "jit",
  purge: ["app/**/*.{jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["open-sans", "sans-serif"],
    },
  },
  plugins: [],
};
