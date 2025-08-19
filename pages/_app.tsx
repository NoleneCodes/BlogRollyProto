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
    }

    // Track page views on route changes (only if user consented)
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Track initial page load
    trackPageView(window.location.pathname + window.location.search);

    // Preload critical resources
    if (typeof window !== 'undefined') {
      // Stabilize development environment
      if (process.env.NODE_ENV === 'development') {
        // Development mode - no console overrides
        console.log('Development server initialized');
      }

      // Remove unused service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
    }

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