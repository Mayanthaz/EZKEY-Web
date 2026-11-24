import type { NextConfig } from "next";

const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  cacheComponents: true,

  async rewrites() {
    // The admin panel talks to the Spring Boot backend through this same-origin
    // path, so its HttpOnly session cookies work without any CORS setup.
    const backend = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
    return [
      {
        source: "/admin-api/:path*",
        destination: `${backend}/api/admin/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Hero background videos. Browsers and CDNs keep them for a year.
        // To ship a new version of a clip, rename the file or bump
        // VIDEO_VERSION in components/layout/HeroVideoBackground.tsx.
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        // Static product images rarely change; cache for a week and allow
        // serving a stale copy while revalidating in the background.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
