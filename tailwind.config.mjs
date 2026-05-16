export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf4e8",
        linen: "#fffaf2",
        biscuit: "#e5d5bd",
        cocoa: "#5a371e",
        espresso: "#21140c",
        caramel: "#b88442",
        saffron: "#d9a44f",
        ink: "#16110d",
        muted: "#806d59",
        whatsapp: "#25d366"
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Jost", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 24px 80px rgba(33, 20, 12, .16)",
        soft: "0 18px 50px rgba(90, 55, 30, .10)"
      }
    }
  },
  plugins: []
};
