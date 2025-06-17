import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: "./build",
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
      "@sass": resolve(__dirname, "src/styles"),
      devextreme: resolve(__dirname, "node_modules/devextreme"),
    },
  },
  server: {  allowedHosts: ["dd00-2a0c-5a82-1200-5600-a8fa-3163-4e34-81fe.ngrok-free.app"]
},
});
