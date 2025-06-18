/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable Server Components (default in Next.js 14)
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Optimize for better performance
    optimizePackageImports: ['lucide-react', 'date-fns', 'chart.js'],
  },

  // TypeScript configuration
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'utils', 'types'],
  },

  // Images configuration for optimization
  images: {
    // Allowed domains for external images
    domains: [
      'supabase.co',
      'github.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    // Image formats to support
    formats: ['image/webp', 'image/avif'],
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analysis.html',
          })
        )
      }
      return config
    },
  }),

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
            },
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 20,
            },
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|lodash|clsx)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      }
    }

    // Handle xlsx files
    config.module.rules.push({
      test: /\.xlsx$/,
      use: 'file-loader',
    })

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      { module: /node_modules\/encoding/ },
    ]

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Platform-specific CSP
          ...(process.env.RENDER ? [{
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
          }] : []),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API-specific headers
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? (process.env.RENDER 
                  ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` 
                  : 'https://recruiting-dashboard.vercel.app')
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(favicon.ico|favicon.svg|apple-touch-icon.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for better UX
  async redirects() {
    return [
      // Redirect old paths
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/',
        permanent: true,
      },
      // Redirect invalid role paths
      {
        source: '/(admin|user|client)/dashboard',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Rewrites for clean URLs (if needed)
  async rewrites() {
    return [
      // API rewrites (if using external APIs)
      {
        source: '/api/external/:path*',
        destination: 'https://api.external-service.com/:path*',
      },
    ]
  },

  // Environment variables validation
  env: {
    CUSTOM_BUILD_ID: process.env.RENDER_GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    BUILD_TIME: new Date().toISOString(),
    DEPLOY_PLATFORM: process.env.RENDER ? 'render' : (process.env.VERCEL ? 'vercel' : 'local'),
  },

  // Output configuration for deployment
  // Use 'standalone' for Docker/Render, 'export' for static sites
  output: process.env.DEPLOY_TARGET === 'static' ? 'export' : 'standalone',
  
  // Disable image optimization for Render (unless using custom domains)
  ...(process.env.RENDER && {
    images: {
      unoptimized: true,
    },
  }),

  // Power pack features
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Compression
  compress: true,

  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),

  // Platform-specific analytics
  ...(process.env.VERCEL && {
    analyticsId: process.env.VERCEL_ANALYTICS_ID,
  }),
  ...(process.env.RENDER && {
    // Render-specific configurations
    generateBuildId: async () => {
      return process.env.RENDER_GIT_COMMIT || 'render-build'
    },
  }),

  // Internationalization (future-proofing)
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    localeDetection: false,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Runtime configuration
  serverRuntimeConfig: {
    // Private runtime config (server-side only)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  publicRuntimeConfig: {
    // Public runtime config (client and server)
    appVersion: process.env.npm_package_version || '1.0.0',
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },

  // Trailing slash configuration
  trailingSlash: false,

  // Asset prefix for CDN (if using)
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',

  // Custom webpack plugins for specific optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_ID__: JSON.stringify(buildId),
        __DEV__: JSON.stringify(dev),
        __SERVER__: JSON.stringify(isServer),
      })
    )

    // Optimize for bundle size
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy libraries with lighter alternatives in production
        '@': require('path').resolve(__dirname),
      }
    }

    return config
  },

  // API routes configuration
  async rewrites() {
    return {
      beforeFiles: [
        // Internal rewrites before Next.js routing
      ],
      afterFiles: [
        // External API proxying
        {
          source: '/api/proxy/:path*',
          destination: '/api/proxy-handler?path=:path*',
        },
      ],
      fallback: [
        // Fallback rewrites
      ],
    }
  },
}

// Production-specific configurations
if (process.env.NODE_ENV === 'production') {
  nextConfig.compiler = {
    ...nextConfig.compiler,
    // Additional production optimizations
    reactRemoveProperties: true,
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  }
}

// Development-specific configurations
if (process.env.NODE_ENV === 'development') {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    // Development-specific features
    forceSwcTransforms: false,
  }
}

module.exports = nextConfig
