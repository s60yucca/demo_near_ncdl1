module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  mode: "jit",
  theme: {
    extend: {
      backgroundImage: {
        ticket: "url('/assets/ticket-bg.svg')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
