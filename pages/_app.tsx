import { ErrorProvider } from '../components/ErrorProvider'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider 
  attribute="class" 
  defaultTheme="light" 
  enableSystem={false}
  storageKey="blogrolly-theme"
>
      <ErrorProvider>
        <Component {...pageProps} />
      </ErrorProvider>
    </ThemeProvider>
  )
}

export default MyApp
