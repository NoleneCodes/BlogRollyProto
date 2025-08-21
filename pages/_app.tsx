import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import ErrorBoundary from '../components/ErrorBoundary'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { trackPageView } from '../lib/analytics'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Apply font class to document root - this prevents hydration mismatches
    if (typeof document !== 'undefined') {
      document.documentElement.className = inter.variable;
      
      // Add PWA manifest and meta tags
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);

      // Add theme color meta tag
      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = '#c42142';
      document.head.appendChild(themeColorMeta);

      // Add apple-mobile-web-app-capable
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      document.head.appendChild(appleMeta);

      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      }
    }

    // Track page views on route changes (only if user consented)
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Track initial page load
    trackPageView(window.location.pathname + window.location.search);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default MyApp