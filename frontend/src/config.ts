import { createConfig, http, injected } from 'wagmi'
import { localhost, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [localhost, sepolia],
  connectors: [injected()],
  transports: {
    [localhost.id]: http('http://localhost:8545'),
    [sepolia.id]: http(),
  },
  ssr: true
})
