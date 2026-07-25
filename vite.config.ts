import { defineConfig } from "vite";
import vinext from "vinext";

/**
 * GitHub Pages build: all routes are prerendered and exported as static files.
 * No Cloudflare Worker, database binding, runtime server or secret is used.
 */
export default defineConfig({
  plugins: [
    vinext({
      prerender: { routes: "*" },
    }),
  ],
});
