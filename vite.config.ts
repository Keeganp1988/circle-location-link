import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    const tagger = await componentTagger();
    plugins.push(...(Array.isArray(tagger) ? tagger : [tagger]));
  }

  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: true, // change to "::" only if you require IPv6
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      sourcemap: false, // disables generation of source maps
    },
    envPrefix: 'VITE_',
    // Ensure environment variables are loaded
    define: {
      'process.env': env
    }
  };
});
