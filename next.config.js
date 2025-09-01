/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Optimize for production
  swcMinify: true,
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: [],
    unoptimized: false,
  },
  
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
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
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
    
    // Add alias for path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    
    return config;
  },
  
  experimental: {
    serverComponentsExternalPackages: ["pg", "pg-hstore", "sequelize"],
    optimizeCss: true,
  },
  
  // Ensure Tailwind CSS is processed correctly
  transpilePackages: ['tailwindcss'],
};

module.exports = nextConfig;
