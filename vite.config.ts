import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import fs from "node:fs";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// Dev-only: serve the report_v2 harness's real-report drop from a gitignored
// repo-root `dev-fixtures/` dir. Deliberately NOT under `public/` — Vite copies
// public/ verbatim into dist, which would publish real (tier-ungated) customer
// report content at a static URL. This middleware only exists on the dev server.
const devFixturesPlugin = (): Plugin => ({
  name: "report-v2-dev-fixtures",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/dev-fixtures", (req, res, next) => {
      const name = path.basename(req.url ?? "");
      const file = path.resolve(__dirname, "dev-fixtures", name);
      if (!name.endsWith(".json") || !fs.existsSync(file)) return next();
      res.setHeader("Content-Type", "application/json");
      fs.createReadStream(file).pipe(res);
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'development' && devFixturesPlugin(),
    mcpPlugin(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-toast',
          ],
          'vendor-recharts': ['recharts'],
          'vendor-markdown': ['react-markdown', 'dompurify'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
  },
}));
