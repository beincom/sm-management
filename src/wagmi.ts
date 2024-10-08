import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { arbitrumSepolia, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect, metaMask, safe } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [arbitrumSepolia],
    connectors: [
      injected(),
      // coinbaseWallet(),
      // metaMask(),
      walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      // [sepolia.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
