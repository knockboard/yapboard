// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://yapboard.chamanbudhathoki.com.np",
  base: "/",
  integrations: [tailwind(), react(), sitemap()],
  vite: {
    server: {
      proxy: {
        "/api/": {
          target: "https://yapboard.chamanbudhathoki.com.np",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});