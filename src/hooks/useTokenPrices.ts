import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenPrice {
  token_id: string;
  symbol: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

interface TokenPriceResponse {
  prices: TokenPrice[];
}

interface UseTokenPricesProps {
  tokens: Array<{
    id: string;
    symbol: string;
    contractAddress?: string;
  }>;
  enabled?: boolean;
}

export const useTokenPrices = ({ tokens, enabled = true }: UseTokenPricesProps) => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !tokens || tokens.length === 0) {
      return;
    }

    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching prices for tokens:', tokens);

        const { data, error: functionError } = await supabase.functions.invoke('get-token-prices', {
          body: { tokens }
        });

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(functionError.message || 'Failed to fetch token prices');
        }

        if (!data || !data.prices) {
          throw new Error('Invalid response from price service');
        }

        console.log('Received prices:', data.prices);
        setPrices(data.prices);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching token prices:', errorMessage);
        setError(errorMessage);
        setPrices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, [tokens, enabled]);

  const getPriceForToken = (symbol: string) => {
    return prices.find(price => price.symbol.toLowerCase() === symbol.toLowerCase());
  };

  return {
    prices,
    isLoading,
    error,
    getPriceForToken,
    refetch: () => {
      if (enabled && tokens && tokens.length > 0) {
        // Trigger a refetch by updating the dependency
        const fetchPrices = async () => {
          setIsLoading(true);
          setError(null);

          try {
            const { data, error: functionError } = await supabase.functions.invoke('get-token-prices', {
              body: { tokens }
            });

            if (functionError) {
              throw new Error(functionError.message || 'Failed to fetch token prices');
            }

            if (!data || !data.prices) {
              throw new Error('Invalid response from price service');
            }

            setPrices(data.prices);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            setPrices([]);
          } finally {
            setIsLoading(false);
          }
        };

        fetchPrices();
      }
    }
  };
};