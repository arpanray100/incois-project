// pages/_app.tsx
import '../styles/globals.css'
import '../styles/dashboard.css'
import 'react-image-lightbox/style.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
