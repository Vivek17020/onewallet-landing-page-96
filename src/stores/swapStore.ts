import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
  price: number;
  address: string;
  decimals: number;
}

export interface Transaction {
  id: string;
  type: 'swap' | 'send' | 'receive';
  fromToken: string;
  toToken?: string;
  fromAmount: string;
  toAmount?: string;
  status: 'completed' | 'pending' | 'failed' | 'simulated';
  timestamp: string;
  timeAgo: string;
  hash: string;
  network: string;
  fee: string;
  value: string;
  tags?: string[];
}

interface SwapState {
  tokens: Token[];
  transactions: Transaction[];
  
  // Actions
  updateTokenBalance: (symbol: string, newBalance: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timeAgo'>) => void;
  executeSwap: (fromToken: string, toToken: string, fromAmount: string, toAmount: string, fee: string) => void;
  getTokenBalance: (symbol: string) => string;
}

const initialTokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    balance: "2.4567",
    price: 2678.34,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    balance: "1,250.00",
    price: 1.00,
    address: "0xA0b86a33E6441E71de9E6A8669B3aBbEe9B4A6a5",
    decimals: 6
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    balance: "456.789",
    price: 0.87,
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    decimals: 18
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    icon: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    balance: "89.123",
    price: 13.45,
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "0x1234...5678",
    type: "swap",
    fromToken: "ETH",
    toToken: "USDC",
    fromAmount: "1.5",
    toAmount: "2,517.45",
    status: "completed",
    timestamp: "2024-09-01T14:30:00Z",
    timeAgo: "2 hours ago",
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    network: "Ethereum",
    fee: "$12.45",
    value: "$4,022.14"
  },
  {
    id: "0x2345...6789",
    type: "send",
    fromToken: "BTC",
    fromAmount: "0.05",
    status: "completed",
    timestamp: "2024-09-01T11:30:00Z",
    timeAgo: "5 hours ago",
    hash: "0x2345678901bcdef12345678901bcdef123456789",
    network: "Bitcoin",
    fee: "$8.20",
    value: "$2,206.18"
  },
  {
    id: "0x3456...7890",
    type: "receive",
    fromToken: "MATIC",
    fromAmount: "100",
    status: "pending",
    timestamp: "2024-08-31T14:30:00Z",
    timeAgo: "1 day ago",
    hash: "0x3456789012cdef123456789012cdef1234567890",
    network: "Polygon",
    fee: "$0.02",
    value: "$87.00"
  }
];

const generateTransactionId = () => {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  return `0x${Array.from({ length: 4 }, randomHex).join('')}...${Array.from({ length: 4 }, randomHex).join('')}`;
};

const generateTransactionHash = () => {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  return `0x${Array.from({ length: 40 }, randomHex).join('')}`;
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

export const useSwapStore = create<SwapState>()(
  persist(
    (set, get) => ({
      tokens: initialTokens,
      transactions: initialTransactions,
      
      updateTokenBalance: (symbol, newBalance) => {
        set((state) => ({
          tokens: state.tokens.map(token => 
            token.symbol === symbol 
              ? { ...token, balance: newBalance }
              : token
          )
        }));
      },
      
      addTransaction: (transaction) => {
        const id = generateTransactionId();
        const timeAgo = formatTimeAgo(transaction.timestamp);
        
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id,
              timeAgo
            },
            ...state.transactions
          ]
        }));
      },
      
      executeSwap: (fromToken, toToken, fromAmount, toAmount, fee) => {
        const state = get();
        
        // Update balances
        const fromTokenData = state.tokens.find(t => t.symbol === fromToken);
        const toTokenData = state.tokens.find(t => t.symbol === toToken);
        
        if (fromTokenData && toTokenData) {
          // Deduct from fromToken
          const currentFromBalance = parseFloat(fromTokenData.balance.replace(/,/g, ''));
          const swapFromAmount = parseFloat(fromAmount);
          const newFromBalance = (currentFromBalance - swapFromAmount).toFixed(6);
          
          // Add to toToken
          const currentToBalance = parseFloat(toTokenData.balance.replace(/,/g, ''));
          const swapToAmount = parseFloat(toAmount.replace(/,/g, ''));
          const newToBalance = (currentToBalance + swapToAmount).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          });
          
          // Update both balances
          set((state) => ({
            tokens: state.tokens.map(token => {
              if (token.symbol === fromToken) {
                return { ...token, balance: newFromBalance };
              }
              if (token.symbol === toToken) {
                return { ...token, balance: newToBalance };
              }
              return token;
            })
          }));
          
          // Add transaction
          const timestamp = new Date().toISOString();
          const fromTokenValue = swapFromAmount * fromTokenData.price;
          
          get().addTransaction({
            type: 'swap',
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            status: 'simulated',
            timestamp,
            hash: generateTransactionHash(),
            network: 'Ethereum',
            fee,
            value: `$${fromTokenValue.toFixed(2)}`,
            tags: ['SIMULATED']
          });
        }
      },
      
      getTokenBalance: (symbol) => {
        const token = get().tokens.find(t => t.symbol === symbol);
        return token?.balance || '0';
      }
    }),
    {
      name: 'swap-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);