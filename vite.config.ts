import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import type { ConfigEnv } from "vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// On Vercel, use Nitro's Vercel adapter and disable the Cloudflare build plugin.
export default async function config(env: ConfigEnv) {
  const isVercel = process.env.VERCEL === "1";

  return defineLovableConfig({
    cloudflare: isVercel ? false : undefined,
    plugins: isVercel ? [nitro({ preset: "vercel" })] : [],
    tanstackStart: {
      server: { entry: "server" },
    },
  })(env);
}
