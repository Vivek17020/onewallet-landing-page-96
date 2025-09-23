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

interface DemoData {
  address: string;
  nativeBalance: string;
  tokenBalances: TokenBalance[];
  totalUsdValue: number;
}

interface DemoState {
  isDemoMode: boolean;
  demoData: DemoData;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const mockTokenBalances: TokenBalance[] = [
  {
    address: '0xa0b86a33e6b2d4e6a9e4f8b3b7d5e8f9c2a1b0c9',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: '2500000000',
    formattedBalance: '2500.00',
    usdValue: 2500.00
  },
  {
    address: '0xa0b86a33e6b2d4e6a9e4f8b3b7d5e8f9c2a1b0c8',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    balance: '1750000000',
    formattedBalance: '1750.00',
    usdValue: 1750.00
  },
  {
    address: '0xa0b86a33e6b2d4e6a9e4f8b3b7d5e8f9c2a1b0c7',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    balance: '15000000',
    formattedBalance: '0.15',
    usdValue: 14250.00
  }
];

const demoData: DemoData = {
  address: '0x742d35Cc6558C3e24b03d2D9f9C9c7a4ae2c8910',
  nativeBalance: '3.5',
  tokenBalances: mockTokenBalances,
  totalUsdValue: 21500.00
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      isDemoMode: false,
      demoData,
      
      toggleDemoMode: () => {
        const currentMode = get().isDemoMode;
        set({ isDemoMode: !currentMode });
      },
      
      setDemoMode: (enabled: boolean) => {
        set({ isDemoMode: enabled });
      }
    }),
    {
      name: 'demo-mode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);