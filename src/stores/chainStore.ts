import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    icon: '⟡'
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '⬟'
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arbitrum.llamarpc.com',
    explorerUrl: 'https://arbiscan.io',
    icon: '🔷'
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://base.llamarpc.com',
    explorerUrl: 'https://basescan.org',
    icon: '🔵'
  }
];

interface ChainState {
  selectedChain: Chain;
  setSelectedChain: (chain: Chain) => void;
  getChainById: (id: number) => Chain | undefined;
}

export const useChainStore = create<ChainState>()(
  persist(
    (set, get) => ({
      selectedChain: SUPPORTED_CHAINS[0], // Default to Ethereum
      
      setSelectedChain: (chain: Chain) => {
        set({ selectedChain: chain });
      },
      
      getChainById: (id: number) => {
        return SUPPORTED_CHAINS.find(chain => chain.id === id);
      },
    }),
    {
      name: 'chain-storage',
    }
  )
);