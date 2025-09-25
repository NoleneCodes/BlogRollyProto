import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { ErrorProvider } from '../components/ErrorProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ErrorProvider>
        <Component {...pageProps} />
      </ErrorProvider>
    </ThemeProvider>
  )
}

export default MyApp
