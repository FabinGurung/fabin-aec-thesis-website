import { defineConfig } from "vite";
import vinext from "vinext";
import nextConfig from "./next.config";

/**
 * GitHub Pages build.
 *
 * Pass the existing Next-compatible configuration directly to Vinext so that
 * output: "export", trailingSlash and the GitHub Pages basePath are applied
 * during the static-export build.
 */
export default defineConfig({
  plugins: [
    vinext({
      nextConfig,
      prerender: { routes: "*" },
    }),
  ],
});
