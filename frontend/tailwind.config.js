export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#1e3a5f",
          700: "#2a4b75",
          500: "#3b5f8a"
        },
        success: "#1f9d55",
        danger: "#c0392b"
      }
    }
  },
  plugins: []
};
