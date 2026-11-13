import { cpSync, existsSync } from "node:fs";
// Next's standalone server needs static assets alongside its traced dependencies.
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) cpSync("public", ".next/standalone/public", { recursive: true });
