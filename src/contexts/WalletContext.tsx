import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { useWalletStore } from '@/stores/walletStore';
import type { Connector } from 'wagmi';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  activeChain: number | null;
  connectWallet: (connectorId?: string) => Promise<void>;
  disconnectWallet: () => void;
  shortenAddress: (address: string) => string;
  connectors: readonly Connector[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Zustand store
  const {
    setAddress,
    setActiveChain,
    setIsConnected,
    autoConnect,
    lastConnectedConnector,
    setAutoConnect,
    setLastConnectedConnector,
    reset,
  } = useWalletStore();

  // Sync wagmi state with Zustand store
  useEffect(() => {
    setAddress(address || null);
  }, [address, setAddress]);

  useEffect(() => {
    setActiveChain(chainId || null);
  }, [chainId, setActiveChain]);

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    if (autoConnect && lastConnectedConnector && !isConnected) {
      const connector = connectors.find(c => c.id === lastConnectedConnector);
      if (connector) {
        connect({ connector });
      }
    }
  }, [autoConnect, lastConnectedConnector, isConnected, connectors, connect]);

  const shortenAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const connectWallet = async (connectorId?: string) => {
    try {
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) || connectors[0]
        : connectors[0];
      
      await connect({ connector });
      
      // Store connection for persistence
      setAutoConnect(true);
      setLastConnectedConnector(connector.id);
      
      toast({
        title: "Wallet Connected!",
        description: `Connected to ${address ? shortenAddress(address) : 'wallet'}`,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    reset(); // Reset all store state
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <WalletContext.Provider
      value={{
        account: address || null,
        isConnected,
        activeChain: chainId || null,
        connectWallet,
        disconnectWallet,
        shortenAddress,
        connectors,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};