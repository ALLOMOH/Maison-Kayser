import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

import vercel from "@astrojs/vercel";

export default defineConfig({
 image:{
    domains:["images.unsplash.com","astro.build"],
    remotePatterns:[{protocol: "https"}],

 },
  output: "server",
  adapter: vercel({
   webAnalytics:{
     enable:true,
   },
  entrypointResolution:"auto"
  }),

  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ["**/*.woff2", "**/*.woff"]
  }
});
