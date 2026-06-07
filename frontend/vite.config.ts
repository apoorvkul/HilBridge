import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "frontend",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:4317"
    },
    fs: {
      allow: [".."]
    }
  },
  build: {
    outDir: "../dist/frontend",
    emptyOutDir: true
  }
});
