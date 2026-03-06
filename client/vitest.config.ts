import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom", // simulates browser environment
        globals: true, // allows using describe, it, expect without imports
        setupFiles: ["./src/test/setup.ts"], // optional setup file
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
    },
});
