import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',

  // Image optimization turned off for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
