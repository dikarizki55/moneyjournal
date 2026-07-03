import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.11", "*.local-origin.dev"],
};

export default nextConfig;
