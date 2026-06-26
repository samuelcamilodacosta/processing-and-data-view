import type { NextConfig } from "next";

const basePath =
  process.env.NETLIFY === "true" ? "" : "/processing-and-data-view";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
