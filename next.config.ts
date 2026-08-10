import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.20", "*.local-origin.dev", "172.20.10.7"],
};

export default nextConfig;
