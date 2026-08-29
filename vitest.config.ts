import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // These are Node-only unit tests over pure functions. Without this, Vite
  // loads the app's Tailwind/PostCSS pipeline, which the tests do not need and
  // which does not resolve outside a Next build.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["lib/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
