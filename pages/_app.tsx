import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from '../contexts/wallet'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Toaster position="top-right" />
        <Component {...pageProps} />
    </WalletProvider>
  )
}
