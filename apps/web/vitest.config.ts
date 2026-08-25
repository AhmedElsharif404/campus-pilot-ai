import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/**", ".next/**"],
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
});
