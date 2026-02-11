import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "vite-plugin-sitemap";
import { VitePWA } from "vite-plugin-pwa";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

const langs = [
  "en",
  "vi",
  "es",
  "fr",
  "de",
  "ja",
  "ko",
  "zh",
  "ru",
  "pt",
  "it",
  "hi",
];
const dynamicRoutes = langs.map((lang) => `?lng=${lang}`);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    sitemap({
      hostname: "https://btc-dca-calculator.vercel.app",
      dynamicRoutes,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "Bitcoin DCA Calculator",
        short_name: "BTC DCA",
        description: "A professional Dollar Cost Averaging calculator for Bitcoin and other assets.",
        theme_color: "#0f111a",
        background_color: "#0f111a",
        display: "standalone",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.binance\.com\/api\/v3\/klines/,
            handler: "NetworkFirst",
            options: {
              cacheName: "binance-api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/api\/v3\/coins/,
            handler: "NetworkFirst",
            options: {
              cacheName: "coingecko-api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
