/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    css: true,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "node_modules/",
      "tests/**/*", // Exclude Playwright tests
      "**/*.d.ts",
      "**/*.config.*",
      "**/coverage/**",
      "**/dist/**",
      "**/.next/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/tests/",
        "tests/**/*", // Exclude Playwright tests from coverage
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "**/dist/**",
        "**/.next/**",
      ],
    },
    // Timeout for tests that might load translation files
    testTimeout: 10000,
    // Retry flaky tests
    retry: 2,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/messages": path.resolve(__dirname, "./messages"),
      "@/i18n": path.resolve(__dirname, "./i18n.ts"),
    },
  },
});
