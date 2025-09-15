import { useEffect } from 'react';
import { useBalance } from 'wagmi';
import { useWalletStore } from '@/stores/walletStore';
import { formatEther } from 'viem';
import { mainnet, sepolia } from 'wagmi/chains';

export const useBalances = () => {
  const { address, activeChain, setNativeBalance, setTotalUsdValue } = useWalletStore();
  
  // Ensure chainId is valid for wagmi
  const validChainId = activeChain === mainnet.id || activeChain === sepolia.id ? activeChain : undefined;
  
  // Get native balance using wagmi
  const { data: balance, isLoading } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: validChainId,
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

  return {
    nativeBalance: balance ? formatEther(balance.value) : null,
    isLoading,
    symbol: balance?.symbol || 'ETH',
  };
};