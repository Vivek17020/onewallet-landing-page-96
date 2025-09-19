import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QuoteParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  slippage?: number;
}

interface Protocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

interface QuoteResponse {
  toTokenAmount: string;
  estimatedGas: number;
  protocols: Protocol[][][];
  fromToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
  toToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
}

const CHAIN_ID = 1; // Ethereum mainnet
const BASE_URL = 'https://api.1inch.dev/swap/v5.2';

export const use1inchApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem('1inch_api_key') || ''
  );
  const { toast } = useToast();

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('1inch_api_key', key);
  }, []);

  const getQuote = useCallback(async (params: QuoteParams): Promise<QuoteResponse | null> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your 1inch API key first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const url = new URL(`${BASE_URL}/${CHAIN_ID}/quote`);
      url.searchParams.append('src', params.fromTokenAddress);
      url.searchParams.append('dst', params.toTokenAddress);
      url.searchParams.append('amount', params.amount);
      
      if (params.slippage) {
        url.searchParams.append('slippage', params.slippage.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('1inch API error:', error);
      toast({
        title: "Quote Failed",
        description: error.message || "Failed to fetch quote from 1inch",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, toast]);

  const getProtocolSummary = useCallback((protocols: Protocol[][][]): string[] => {
    const protocolNames = new Set<string>();
    
    protocols.forEach(route => {
      route.forEach(step => {
        step.forEach(protocol => {
          protocolNames.add(protocol.name);
        });
      });
    });
    
    return Array.from(protocolNames);
  }, []);

  const calculatePriceImpact = useCallback((
    fromAmount: string,
    toAmount: string,
    fromPrice: number,
    toPrice: number
  ): number => {
    const expectedOutput = (parseFloat(fromAmount) * fromPrice) / toPrice;
    const actualOutput = parseFloat(toAmount);
    return ((expectedOutput - actualOutput) / expectedOutput) * 100;
  }, []);

  return {
    apiKey,
    saveApiKey,
    getQuote,
    getProtocolSummary,
    calculatePriceImpact,
    isLoading,
  };
};