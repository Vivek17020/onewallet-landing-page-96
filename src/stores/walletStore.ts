import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  usdValue?: number;
}

interface WalletState {
  // Core wallet state
  address: string | null;
  activeChain: number | null;
  isConnected: boolean;
  
  // Balances
  nativeBalance: string | null;
  tokenBalances: TokenBalance[];
  totalUsdValue: number;
  
  // Connection persistence
  autoConnect: boolean;
  lastConnectedConnector: string | null;
  
  // Actions
  setAddress: (address: string | null) => void;
  setActiveChain: (chainId: number | null) => void;
  setIsConnected: (connected: boolean) => void;
  setNativeBalance: (balance: string | null) => void;
  setTokenBalances: (balances: TokenBalance[]) => void;
  setTotalUsdValue: (value: number) => void;
  setAutoConnect: (autoConnect: boolean) => void;
  setLastConnectedConnector: (connector: string | null) => void;
  reset: () => void;
}

const initialState = {
  address: null,
  activeChain: null,
  isConnected: false,
  nativeBalance: null,
  tokenBalances: [],
  totalUsdValue: 0,
  autoConnect: false,
  lastConnectedConnector: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setAddress: (address) => set({ address }),
      setActiveChain: (chainId) => set({ activeChain: chainId }),
      setIsConnected: (connected) => set({ isConnected: connected }),
      setNativeBalance: (balance) => set({ nativeBalance: balance }),
      setTokenBalances: (balances) => set({ tokenBalances: balances }),
      setTotalUsdValue: (value) => set({ totalUsdValue: value }),
      setAutoConnect: (autoConnect) => set({ autoConnect }),
      setLastConnectedConnector: (connector) => set({ lastConnectedConnector: connector }),
      
      reset: () => set({
        ...initialState,
        autoConnect: false,
        lastConnectedConnector: null,
      }),
    }),
    {
      name: 'onewallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        autoConnect: state.autoConnect,
        lastConnectedConnector: state.lastConnectedConnector,
        // Don't persist sensitive data like balances
      }),
    }
  )
);