import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import ErrorBoundary from '../components/ErrorBoundary'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { initGA, trackPageView } from '../lib/analytics'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize Google Analytics
    initGA();

    // Track page views on route changes
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
        // Disable automatic refresh on certain development warnings
        const originalError = console.error;
        console.error = (...args) => {
          if (args[0]?.includes?.('Fast Refresh')) {
            return;
          }
          originalError(...args);
        };
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
