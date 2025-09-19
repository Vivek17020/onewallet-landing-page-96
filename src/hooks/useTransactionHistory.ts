import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/stores/swapStore';

interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timeStamp: string;
  contractAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  confirmations: string;
  isError: string;
}

interface PolygonscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timeStamp: string;
  contractAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  confirmations: string;
  isError: string;
}

interface ApiKeys {
  etherscan: string;
  polygonscan: string;
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(parseInt(timestamp) * 1000);
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

const normalizeTransaction = (
  tx: EtherscanTransaction | PolygonscanTransaction, 
  userAddress: string, 
  network: 'Ethereum' | 'Polygon'
): Transaction => {
  const isIncoming = tx.to.toLowerCase() === userAddress.toLowerCase();
  const isOutgoing = tx.from.toLowerCase() === userAddress.toLowerCase();
  const failed = tx.isError === '1';
  
  // Determine transaction type
  let type: Transaction['type'] = 'send';
  if (isIncoming && !isOutgoing) {
    type = 'receive';
  } else if (tx.contractAddress && tx.tokenSymbol) {
    type = 'swap'; // Token transactions could be swaps
  }
  
  // Calculate value in ETH/MATIC
  const valueInEth = parseFloat(tx.value) / Math.pow(10, 18);
  const gasUsed = parseFloat(tx.gasUsed);
  const gasPrice = parseFloat(tx.gasPrice);
  const feeInEth = (gasUsed * gasPrice) / Math.pow(10, 18);
  
  // Format amounts
  const tokenSymbol = tx.tokenSymbol || (network === 'Ethereum' ? 'ETH' : 'MATIC');
  const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18;
  const tokenValue = tx.tokenSymbol ? parseFloat(tx.value) / Math.pow(10, decimals) : valueInEth;
  
  return {
    id: `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`,
    type,
    fromToken: type === 'receive' ? tokenSymbol : tokenSymbol,
    toToken: type === 'swap' ? 'USDC' : undefined, // Simplified - would need more logic to detect actual swap pairs
    fromAmount: tokenValue.toFixed(6),
    toAmount: type === 'swap' ? (tokenValue * 0.99).toFixed(6) : undefined, // Mock swap output
    status: failed ? 'failed' : 'completed',
    timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
    timeAgo: formatTimeAgo(tx.timeStamp),
    hash: tx.hash,
    network,
    fee: `$${(feeInEth * (network === 'Ethereum' ? 2500 : 0.8)).toFixed(2)}`, // Rough USD estimate
    value: `$${(tokenValue * (network === 'Ethereum' ? 2500 : 0.8)).toFixed(2)}` // Rough USD estimate
  };
};

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => ({
    etherscan: localStorage.getItem('etherscan_api_key') || '',
    polygonscan: localStorage.getItem('polygonscan_api_key') || ''
  }));
  
  const { account } = useWallet();
  const { toast } = useToast();

  const saveApiKey = useCallback((network: 'etherscan' | 'polygonscan', key: string) => {
    setApiKeys(prev => ({ ...prev, [network]: key }));
    localStorage.setItem(`${network}_api_key`, key);
  }, []);

  const fetchEtherscanTransactions = async (address: string, apiKey: string): Promise<Transaction[]> => {
    if (!apiKey) throw new Error('Etherscan API key required');
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Etherscan API error');
    }
    
    return data.result.map((tx: EtherscanTransaction) => normalizeTransaction(tx, address, 'Ethereum'));
  };

  const fetchPolygonscanTransactions = async (address: string, apiKey: string): Promise<Transaction[]> => {
    if (!apiKey) throw new Error('Polygonscan API key required');
    
    const response = await fetch(
      `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Polygonscan API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Polygonscan API error');
    }
    
    return data.result.map((tx: PolygonscanTransaction) => normalizeTransaction(tx, address, 'Polygon'));
  };

  const fetchTransactions = useCallback(async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const promises: Promise<Transaction[]>[] = [];
      
      // Fetch from Etherscan if API key is available
      if (apiKeys.etherscan) {
        promises.push(fetchEtherscanTransactions(account, apiKeys.etherscan));
      }
      
      // Fetch from Polygonscan if API key is available
      if (apiKeys.polygonscan) {
        promises.push(fetchPolygonscanTransactions(account, apiKeys.polygonscan));
      }
      
      if (promises.length === 0) {
        setError('Please set API keys for Etherscan and/or Polygonscan to fetch transaction history');
        return;
      }
      
      const results = await Promise.allSettled(promises);
      const allTransactions: Transaction[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allTransactions.push(...result.value);
        } else {
          console.error(`API ${index === 0 ? 'Etherscan' : 'Polygonscan'} error:`, result.reason);
          toast({
            title: `${index === 0 ? 'Etherscan' : 'Polygonscan'} API Error`,
            description: result.reason.message,
            variant: 'destructive'
          });
        }
      });
      
      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setTransactions(allTransactions);
      
      if (allTransactions.length > 0) {
        toast({
          title: 'Transaction History Loaded',
          description: `Found ${allTransactions.length} transactions`
        });
      }
      
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Failed to fetch transaction history',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, apiKeys, toast]);

  // Auto-fetch when address or API keys change
  useEffect(() => {
    if (account && (apiKeys.etherscan || apiKeys.polygonscan)) {
      fetchTransactions();
    }
  }, [account, apiKeys.etherscan, apiKeys.polygonscan, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    apiKeys,
    saveApiKey,
    fetchTransactions,
    hasApiKeys: !!(apiKeys.etherscan || apiKeys.polygonscan)
  };
};