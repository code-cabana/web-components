import { defineConfig } from "astro/config";
import { watchPublic } from "./src/lib/vite.mjs";

export default defineConfig({
  server: { port: 4000 },
  vite: {
    plugins: [watchPublic()],
  },
});
