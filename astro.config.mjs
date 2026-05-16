import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

export default defineConfig({
 image:{
    domains:["images.unsplash.com","astro.build"],
    remotePatterns:[{protocol: "https"}],

 },
  output: "server",
  adapter: node({
    mode: "standalone"
  }),

  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ["**/*.woff2", "**/*.woff"]
  }
});
