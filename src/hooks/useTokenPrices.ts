import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useChainStore } from '@/stores/chainStore';

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
  const { selectedChain } = useChainStore();

  const fetchPrices = useCallback(async (maxRetries = 3) => {
    if (!enabled || tokens.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const makeRequest = async (attempt = 0): Promise<void> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-token-prices', {
          body: { tokens: tokens.map(t => t.symbol) }
        });
        
        if (error) throw error;
        
        setPrices(data?.prices || []);
      } catch (err: any) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          return makeRequest(attempt + 1);
        }
        throw err;
      }
    };
    
    try {
      await makeRequest();
    } catch (err: any) {
      console.error('Failed to fetch token prices:', err);
      setError(err.message || 'Failed to fetch token prices');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

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