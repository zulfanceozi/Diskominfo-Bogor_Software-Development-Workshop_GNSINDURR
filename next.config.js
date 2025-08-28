/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for Sequelize and pg package
      config.externals = config.externals || [];
      config.externals.push({
        pg: "commonjs pg",
        "pg-hstore": "commonjs pg-hstore",
        sequelize: "commonjs sequelize",
      });

      // Add fallback for pg
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        "pg-hstore": false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["pg", "pg-hstore", "sequelize"],
  },
};

module.exports = nextConfig;
