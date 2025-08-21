

import type { NextConfig } from "next";
import { env } from "process";
import { withSentryConfig } from '@sentry/nextjs';

// Force disable Fast Refresh via environment
process.env.FAST_REFRESH = 'false';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  
  // Completely disable React features that cause reloads
  reactStrictMode: false,
  
  // Disable all experimental features and Fast Refresh
  experimental: {
    fastRefresh: false
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

  // Completely disable webpack hot reloading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Remove ALL hot reloading plugins
      config.plugins = config.plugins.filter(plugin => {
        const name = plugin.constructor.name;
        return !name.includes('HotModuleReplacement') && 
               !name.includes('ReactRefresh') &&
               name !== 'webpack-dev-middleware';
      });
      
      // Disable file watching completely
      config.watchOptions = {
        ignored: /./,  // Ignore everything
        poll: false
      };
      
      // Disable HMR entry points
      if (config.entry && typeof config.entry === 'object') {
        Object.keys(config.entry).forEach(key => {
          if (Array.isArray(config.entry[key])) {
            config.entry[key] = config.entry[key].filter(entry => 
              !entry.includes('webpack-hot-middleware') &&
              !entry.includes('react-refresh')
            );
          }
        });
      }
      
      // Force disable Fast Refresh in all SWC configurations
      config.module.rules.forEach(rule => {
        if (rule.use) {
          const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
          uses.forEach(use => {
            if (use && typeof use === 'object' && use.loader) {
              if (use.loader.includes('next-swc-loader')) {
                use.options = {
                  ...use.options,
                  refresh: false,
                  development: false
                };
              }
            }
          });
        }
      });
      
      // Disable HMR completely
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      };
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

