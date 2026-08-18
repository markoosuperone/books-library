import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Google Books cover art. The API hands back `http://` URLs, which we
        // upgrade to https at the call site rather than allowlisting plaintext
        // here — the same assets serve fine over TLS.
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/content",
      },
    ],
  },
};

export default nextConfig;
