import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

const certPath = "/etc/letsencrypt/live/mindcra.com-0001";
const hasCerts = fs.existsSync(`${certPath}/privkey.pem`) && 
                 fs.existsSync(`${certPath}/cert.pem`) && 
                 fs.existsSync(`${certPath}/chain.pem`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    host: "0.0.0.0",
    port: 444,
    https: hasCerts ? {
      key: fs.readFileSync(`${certPath}/privkey.pem`),
      cert: fs.readFileSync(`${certPath}/cert.pem`),
      ca: fs.readFileSync(`${certPath}/chain.pem`),
    } : false,
    proxy: {
      "/api": {
        target: "https://mindcra.com:3000",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "localhost",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "var/www/cpanel",
    emptyOutDir: true,
  },
});
