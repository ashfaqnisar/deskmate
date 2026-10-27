import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "~": new URL("./src", import.meta.url).pathname },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET ?? "http://localhost:3000",
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            if (!("writeHead" in res)) return;
            res.writeHead(502, { "content-type": "application/json" });
            res.end(JSON.stringify({ error: "The API is not reachable" }));
          });
        },
      },
    },
  },
});
