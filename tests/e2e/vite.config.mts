import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({ root, resolve: { alias: [{ find: "next/link", replacement: path.join(root, "link-stub.tsx") }, { find: "@", replacement: path.resolve(root, "../../src") }] }, server: { host: "127.0.0.1", port: 4173, strictPort: true } });
