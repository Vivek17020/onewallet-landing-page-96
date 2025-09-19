import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Get WalletConnect project ID from environment or use a default for development
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base],
  connectors: [
    injected(), // MetaMask, browser wallets
    walletConnect({ projectId }),
    coinbaseWallet({
      appName: 'OneWallet',
      appLogoUrl: 'https://onewallet.app/logo.png',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}