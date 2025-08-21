
import type { NextConfig } from "next";
import { env } from "process";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  
  // Completely disable React Strict Mode and Fast Refresh
  reactStrictMode: false,
  
  // Minimal experimental config
  experimental: {
    optimizeCss: false,
    esmExternals: false,
  },

  // Image optimization
  images: {
    domains: ['yllryygbuyxgbrujdrte.supabase.co'],
    dangerouslyAllowSVG: false,
  },

  // Build optimizations only for production
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    generateEtags: true,
    experimental: {
      optimizeCss: true,
    },
    compiler: {
      removeConsole: true,
    },
  }),

  // Minimal webpack configuration to prevent reload loops
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Completely disable hot reloading and Fast Refresh
      config.plugins = config.plugins.filter(plugin => {
        const name = plugin.constructor.name;
        return name !== 'ReactRefreshWebpackPlugin' && 
               name !== 'HotModuleReplacementPlugin';
      });
      
      // Disable watch options that cause reload loops
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        poll: false,
        aggregateTimeout: 1000,
      };
      
      // Disable module hot replacement
      config.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(use => {
            if (use.loader && use.loader.includes('next-swc-loader')) {
              if (use.options) {
                use.options.refresh = false;
              }
            }
          });
        }
      });
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: 'default-src \'self\'; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' https://www.googletagmanager.com https://www.google-analytics.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; img-src \'self\' data: https:; font-src \'self\' data: https://fonts.gstatic.com; connect-src \'self\' https://www.google-analytics.com https://analytics.google.com https://*.supabase.co; frame-ancestors \'none\';'
          },
          // Cache headers for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Specific cache headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ];
  },

  /* config options here */
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
