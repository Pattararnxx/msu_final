import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Pins the workspace root to this repo explicitly. Without this,
  // Turbopack infers it by walking up for the nearest lockfile — on some
  // teammates' machines that walk finds an unrelated package-lock.json
  // outside the repo (e.g. a parent "D:\code" folder on Windows) and warns
  // "Next.js ignored package-lock.json in ... because it is outside the
  // current Git repository", which is exactly the case this setting
  // resolves for every machine, regardless of what sits above the repo.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
