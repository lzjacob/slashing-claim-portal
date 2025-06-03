import { createConfig, http } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
})

// Your deployed ETH Receiver Contract on Arbitrum Sepolia
export const BOND_CONTRACT_ADDRESS = '0x9fA6BfDA1c0Cc5940A7b2274521E90A0dC994cfB' as const

export const BOND_AMOUNT = '0.1' // 0.1 ETH for testing 