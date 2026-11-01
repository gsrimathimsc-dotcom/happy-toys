import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// During development, calls to /api are forwarded to the ASP.NET Core API.
const apiProxy = { "/api": "http://localhost:5254" };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 5173, proxy: apiProxy },
});
