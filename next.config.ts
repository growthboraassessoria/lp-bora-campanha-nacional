import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // A tabela de ZIP codes dos EUA é lida do disco: precisa ir junto com as rotas que a usam.
  outputFileTracingIncludes: { "/api/zip": ["./data/us-zips.tsv"], "/api/lead": ["./data/us-zips.tsv"], "/api/perfil": ["./data/us-zips.tsv"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
