const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig = {
  // Generate only static HTML/JSON/assets.
  // GitHub Pages never runs a Node server.
  output: "export" as const,
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
