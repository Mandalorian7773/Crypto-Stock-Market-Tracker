import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // Use relative paths for Netlify deployment
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
    },
  },
  // Production build optimizations
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['plotly.js', 'react-plotly.js'],
          firebase: ['firebase/app', 'firebase/auth'],
          utils: ['axios', '@tanstack/react-query']
        }
      }
    },
    // Enable gzip compression
    brotliSize: true,
    chunkSizeWarningLimit: 5000 // Increase limit due to Plotly.js size
  },
  // Enable gzip compression for production
  preview: {
    port: 8080,
    host: '::'
  },
  // Ensure proper MIME types for deployment
  define: {
    global: 'globalThis',
  },
  // Add Node.js polyfills
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'fix-buffer',
          setup(build) {
            build.onResolve({ filter: /^buffer$/ }, () => {
              return { path: require.resolve('buffer/') };
            });
          },
        },
      ],
    },
  },
}));