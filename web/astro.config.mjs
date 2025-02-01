import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // site: "https://yapboard.chamanbudhathoki.com.np",
  base: "/",
  integrations: [
    tailwind(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    sitemap(),
  ],
  vite: {
    server: {
      proxy: {
        "/api/": {
          // target: "https://yapboard.chamanbudhathoki.com.np",
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/images/": {
          // target: "https://yapboard.chamanbudhathoki.com.np",
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
});
