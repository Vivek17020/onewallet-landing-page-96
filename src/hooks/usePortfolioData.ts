import { useMemo } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { useBalances } from '@/hooks/useBalances';
import { useTokenPrices } from '@/hooks/useTokenPrices';

export interface UnifiedToken {
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  rawBalance: string;
  fiatValue: number;
  change24h: number;
  price: number;
  address: string;
  chartData: Array<{ time: string; price: number }>;
}

export const usePortfolioData = () => {
  const { address, isConnected } = useWalletStore();
  const { nativeBalance, isLoading: balancesLoading, symbol } = useBalances();

  // Define tokens we want to fetch prices for
  const tokens = useMemo(() => [
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'usd-coin', symbol: 'USDC' },
    { id: 'tether', symbol: 'USDT' },
    { id: 'dai', symbol: 'DAI' },
    { id: 'wrapped-bitcoin', symbol: 'WBTC' },
    { id: 'uniswap', symbol: 'UNI' },
    { id: 'chainlink', symbol: 'LINK' },
  ], []);

  const { prices, isLoading: pricesLoading, error: pricesError, getPriceForToken } = useTokenPrices({
    tokens,
    enabled: isConnected
  });

  // Create unified token data
  const portfolioTokens = useMemo<UnifiedToken[]>(() => {
    if (!isConnected || !nativeBalance) {
      return [];
    }

    const ethPrice = getPriceForToken('ETH');
    
    if (!ethPrice) {
      return [];
    }

    // For now, only show native ETH balance
    // In the future, this would include all token balances from the wallet
    const nativeToken: UnifiedToken = {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: '🔷',
      balance: parseFloat(nativeBalance).toFixed(4),
      rawBalance: nativeBalance,
      fiatValue: parseFloat(nativeBalance) * ethPrice.current_price,
      change24h: ethPrice.price_change_percentage_24h,
      price: ethPrice.current_price,
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address as placeholder
      chartData: generateMockChartData(ethPrice.current_price, ethPrice.price_change_percentage_24h),
    };

    return [nativeToken];
  }, [nativeBalance, isConnected, getPriceForToken]);

  // Calculate total portfolio value
  const totalValue = useMemo(() => {
    return portfolioTokens.reduce((total, token) => total + token.fiatValue, 0);
  }, [portfolioTokens]);

  // Calculate 24h change for portfolio
  const portfolio24hChange = useMemo(() => {
    if (portfolioTokens.length === 0) return 0;
    
    const totalCurrentValue = portfolioTokens.reduce((sum, token) => sum + token.fiatValue, 0);
    const totalPreviousValue = portfolioTokens.reduce((sum, token) => {
      const previousPrice = token.price / (1 + token.change24h / 100);
      const previousValue = parseFloat(token.rawBalance) * previousPrice;
      return sum + previousValue;
    }, 0);

    if (totalPreviousValue === 0) return 0;
    return ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100;
  }, [portfolioTokens]);

  return {
    tokens: portfolioTokens,
    totalValue,
    portfolio24hChange,
    isLoading: balancesLoading || pricesLoading,
    error: pricesError,
    isConnected,
    address,
  };
};

// Helper function to generate mock chart data based on current price and 24h change
function generateMockChartData(currentPrice: number, change24h: number) {
  const points = 24; // 24 hours worth of data
  const data = [];
  
  const startPrice = currentPrice / (1 + change24h / 100);
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const priceVariation = Math.sin(progress * Math.PI * 2) * (currentPrice * 0.02); // 2% variation
    const trendPrice = startPrice + (currentPrice - startPrice) * progress;
    const price = trendPrice + priceVariation;
    
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      price: Math.max(0, price),
    });
  }
  
  return data;
}