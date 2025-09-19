import { useEffect } from 'react';
import { useBalance } from 'wagmi';
import { useWalletStore } from '@/stores/walletStore';
import { useChainStore } from '@/stores/chainStore';
import { formatEther } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, base } from 'wagmi/chains';

export const useBalances = () => {
  const { address, setNativeBalance, setTotalUsdValue } = useWalletStore();
  const { selectedChain } = useChainStore();
  
  // Map chain IDs to supported wagmi chains
  const getWagmiChain = (chainId: number) => {
    switch (chainId) {
      case 1: return mainnet;
      case 137: return polygon;
      case 42161: return arbitrum;
      case 8453: return base;
      case 11155111: return sepolia;
      default: return mainnet;
    }
  };
  
  const wagmiChain = getWagmiChain(selectedChain.id);
  
  // Get native balance using wagmi (only for supported chains)
  const { data: balance, isLoading } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: wagmiChain.id,
    query: {
      enabled: !!address, // Only fetch if address exists
    },
  });

  // Update native balance in store when it changes
  useEffect(() => {
    if (balance) {
      const formattedBalance = formatEther(balance.value);
      setNativeBalance(formattedBalance);
      
      // TODO: Add price fetching and USD calculation
      // For now, just set a placeholder
      setTotalUsdValue(0);
    } else {
      setNativeBalance(null);
      setTotalUsdValue(0);
    }
  }, [balance, setNativeBalance, setTotalUsdValue]);
  
  // Refetch when selected chain changes
  useEffect(() => {
    if (address) {
      // The useBalance hook will automatically refetch when chainId changes
      setNativeBalance(null);
      setTotalUsdValue(0);
    }
  }, [selectedChain.id, address, setNativeBalance, setTotalUsdValue]);

  return {
    nativeBalance: balance ? formatEther(balance.value) : null,
    isLoading,
    symbol: balance?.symbol || 'ETH',
  };
};