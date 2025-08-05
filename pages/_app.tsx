import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import ErrorBoundary from '../components/ErrorBoundary'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
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
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default MyApp
