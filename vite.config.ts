import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
    },
  },
  fmt: {
    ignorePatterns: ["docs/**", "llm.md", "llms.txt", "test/data/**"],
  },
  test: {
    setupFiles: ["./test/setup.ts"],
    testTimeout: 60000,
    // Local integration tests share a spreadsheet tab and bucket fixtures.
    fileParallelism: process.env.CI === "true",
  },
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
  },
});
