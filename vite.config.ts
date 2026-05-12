import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/229-Hidrodema/" : "/",
  plugins: [react()],
  build: {
    // Sobe o limite de aviso pq Firebase/PDF/Material já saem em chunks próprios.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Separa bibliotecas pesadas em chunks dedicados para melhorar o cache
        // entre deploys e diminuir o JS baixado na primeira tela.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-firebase": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/functions",
            "firebase/storage",
          ],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-pdf": ["jspdf"],
          "vendor-sentry": ["@sentry/react"],
        },
      },
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
