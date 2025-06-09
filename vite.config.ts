import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    const tagger = await componentTagger();
    plugins.push(...(Array.isArray(tagger) ? tagger : [tagger]));
  }

  return {
    server: {
      host: "localhost", // change to "::" only if you require IPv6
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
  };
});
