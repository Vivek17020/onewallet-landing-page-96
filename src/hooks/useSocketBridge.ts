import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BridgeQuoteRequest {
  fromChainId: string;
  toChainId: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
}

interface BridgeQuote {
  routeId: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedTime: string;
  gasFees: string;
  bridgeFee: string;
  totalFee: string;
  protocol: string;
  steps: Array<{
    protocol: string;
    fromChain: string;
    toChain: string;
    estimatedTime: string;
  }>;
}

interface SocketApiResponse {
  success: boolean;
  result: {
    routes: Array<{
      routeId: string;
      fromChainId: number;
      toChainId: number;
      fromAsset: {
        symbol: string;
        name: string;
        decimals: number;
      };
      toAsset: {
        symbol: string;
        name: string;
        decimals: number;
      };
      fromAmount: string;
      toAmount: string;
      totalGasFeesInUsd: number;
      serviceTime: number;
      maxServiceTime: number;
      integratorFee: {
        amount: string;
        asset: {
          symbol: string;
        };
      };
      steps: Array<{
        protocol: {
          name: string;
          displayName: string;
        };
        fromChainId: number;
        toChainId: number;
        serviceTime: number;
        maxServiceTime: number;
      }>;
    }>;
  };
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

const getChainName = (chainId: number): string => {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
  };
  return chains[chainId] || `Chain ${chainId}`;
};

export const useSocketBridge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuotes = useCallback(async (request: BridgeQuoteRequest): Promise<BridgeQuote[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Socket API endpoint for getting quotes
      const API_KEY = localStorage.getItem('socket_api_key') || '';
      
      if (!API_KEY) {
        // For demo purposes, return mock data when no API key is provided
        const mockQuotes: BridgeQuote[] = [
          {
            routeId: 'mock-1',
            fromChain: getChainName(parseInt(request.fromChainId)),
            toChain: getChainName(parseInt(request.toChainId)),
            fromToken: 'ETH',
            toToken: 'ETH',
            fromAmount: request.fromAmount,
            toAmount: (parseFloat(request.fromAmount) * 0.998).toFixed(6),
            estimatedTime: '2-5 min',
            gasFees: '$12.50',
            bridgeFee: '$2.00',
            totalFee: '$14.50',
            protocol: 'Across',
            steps: [
              {
                protocol: 'Across Bridge',
                fromChain: getChainName(parseInt(request.fromChainId)),
                toChain: getChainName(parseInt(request.toChainId)),
                estimatedTime: '2-5 min',
              },
            ],
          },
          {
            routeId: 'mock-2',
            fromChain: getChainName(parseInt(request.fromChainId)),
            toChain: getChainName(parseInt(request.toChainId)),
            fromToken: 'ETH',
            toToken: 'ETH',
            fromAmount: request.fromAmount,
            toAmount: (parseFloat(request.fromAmount) * 0.995).toFixed(6),
            estimatedTime: '10-15 min',
            gasFees: '$8.20',
            bridgeFee: '$5.00',
            totalFee: '$13.20',
            protocol: 'Stargate',
            steps: [
              {
                protocol: 'Stargate',
                fromChain: getChainName(parseInt(request.fromChainId)),
                toChain: getChainName(parseInt(request.toChainId)),
                estimatedTime: '10-15 min',
              },
            ],
          },
          {
            routeId: 'mock-3',
            fromChain: getChainName(parseInt(request.fromChainId)),
            toChain: getChainName(parseInt(request.toChainId)),
            fromToken: 'ETH',
            toToken: 'ETH',
            fromAmount: request.fromAmount,
            toAmount: (parseFloat(request.fromAmount) * 0.992).toFixed(6),
            estimatedTime: '5-8 min',
            gasFees: '$15.00',
            bridgeFee: '$3.50',
            totalFee: '$18.50',
            protocol: 'Hop',
            steps: [
              {
                protocol: 'Hop Protocol',
                fromChain: getChainName(parseInt(request.fromChainId)),
                toChain: getChainName(parseInt(request.toChainId)),
                estimatedTime: '5-8 min',
              },
            ],
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
          title: 'Demo Mode',
          description: 'Showing mock bridge quotes. Add Socket API key for real data.',
        });

        return mockQuotes;
      }

      // Real Socket API call
      const params = new URLSearchParams({
        fromChainId: request.fromChainId,
        toChainId: request.toChainId,
        fromTokenAddress: request.fromTokenAddress,
        toTokenAddress: request.toTokenAddress,
        fromAmount: request.fromAmount,
        userAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        uniqueRoutesPerBridge: 'true',
        sort: 'output',
        singleTxOnly: 'true',
      });

      const response = await fetch(
        `https://api.socket.tech/v2/quote?${params}`,
        {
          headers: {
            'API-KEY': API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Socket API error: ${response.status} ${response.statusText}`);
      }

      const data: SocketApiResponse = await response.json();

      if (!data.success || !data.result?.routes) {
        throw new Error('No routes found');
      }

      // Transform Socket API response to our format
      const quotes: BridgeQuote[] = data.result.routes.slice(0, 5).map((route) => ({
        routeId: route.routeId,
        fromChain: getChainName(route.fromChainId),
        toChain: getChainName(route.toChainId),
        fromToken: route.fromAsset.symbol,
        toToken: route.toAsset.symbol,
        fromAmount: (parseFloat(route.fromAmount) / Math.pow(10, route.fromAsset.decimals)).toFixed(6),
        toAmount: (parseFloat(route.toAmount) / Math.pow(10, route.toAsset.decimals)).toFixed(6),
        estimatedTime: formatTime(route.serviceTime),
        gasFees: `$${route.totalGasFeesInUsd.toFixed(2)}`,
        bridgeFee: route.integratorFee ? `$${(parseFloat(route.integratorFee.amount) / Math.pow(10, 6)).toFixed(2)}` : '$0.00',
        totalFee: `$${(route.totalGasFeesInUsd + (route.integratorFee ? parseFloat(route.integratorFee.amount) / Math.pow(10, 6) : 0)).toFixed(2)}`,
        protocol: route.steps[0]?.protocol?.displayName || 'Unknown',
        steps: route.steps.map((step) => ({
          protocol: step.protocol.displayName,
          fromChain: getChainName(step.fromChainId),
          toChain: getChainName(step.toChainId),
          estimatedTime: formatTime(step.serviceTime),
        })),
      }));

      toast({
        title: 'Bridge Quotes Retrieved',
        description: `Found ${quotes.length} bridge routes`,
      });

      return quotes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bridge quotes';
      setError(errorMessage);
      toast({
        title: 'Failed to fetch bridge quotes',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    fetchQuotes,
    isLoading,
    error,
  };
};