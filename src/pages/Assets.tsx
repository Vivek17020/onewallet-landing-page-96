import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, TrendingDown, Eye, EyeOff, ExternalLink, ChevronDown, Copy, BarChart3 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";

const mockAssets = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "2.4567",
    usdValue: "$4,123.45",
    change24h: "+5.67%",
    isPositive: true,
    contractAddress: "0xa0b86a33e6c3a31d5b2f5b0f8e6b3f8c7a0b86a33e6c3a31d",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.1234",
    usdValue: "$5,432.10",
    change24h: "-2.34%",
    isPositive: false,
    contractAddress: "0xb1c86a33e6c3a31d5b2f5b0f8e6b3f8c7a0b86a33e6c3a31d",
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "1,250.00",
    usdValue: "$1,250.00",
    change24h: "+0.01%",
    isPositive: true,
    contractAddress: "0xa0b173e43e73e73e73e73e73e73e73e73e73e73e73e73e73e7",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    balance: "456.789",
    usdValue: "$367.03",
    change24h: "+12.45%",
    isPositive: true,
    contractAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png"
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    balance: "89.123",
    usdValue: "$1,234.56",
    change24h: "+8.92%",
    isPositive: true,
    contractAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    logo: "https://cryptologos.cc/logos/chainlink-link-logo.png"
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    balance: "25.456",
    usdValue: "$178.90",
    change24h: "-3.21%",
    isPositive: false,
    contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png"
  }
];

export default function Assets() {
  const { isConnected, account } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [expandedAssets, setExpandedAssets] = useState<string[]>([]);
  
  const totalValue = "$11,172.58";

  const toggleAssetExpanded = (symbol: string) => {
    setExpandedAssets(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view your assets and portfolio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">Manage your crypto assets across multiple chains</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setBalanceVisible(!balanceVisible)}
        >
          {balanceVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {balanceVisible ? "Hide" : "Show"} Balance
        </Button>
      </div>

      {/* Total Portfolio Value */}
      <Card className="bg-gradient-secondary border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">
            {balanceVisible ? totalValue : "••••••"}
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-medium">+8.34% (24h)</span>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Assets</h2>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              {mockAssets.map((asset, index) => (
                <Collapsible 
                  key={asset.symbol}
                  open={expandedAssets.includes(asset.symbol)}
                  onOpenChange={() => toggleAssetExpanded(asset.symbol)}
                >
                  <CollapsibleTrigger asChild>
                    <div 
                      className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        index !== mockAssets.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
                          <img 
                            src={asset.logo} 
                            alt={asset.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              // Fallback to colored circle with symbol
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-8 h-8 bg-gradient-primary rounded-full items-center justify-center text-sm font-semibold text-primary-foreground hidden">
                            {asset.symbol.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {balanceVisible ? asset.balance : "••••"} {asset.symbol}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {balanceVisible ? asset.usdValue : "••••••"}
                          </div>
                        </div>
                        
                        <Badge 
                          variant={asset.isPositive ? "default" : "destructive"}
                          className={asset.isPositive ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                        >
                          {asset.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {asset.change24h}
                        </Badge>
                        
                        <ChevronDown 
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            expandedAssets.includes(asset.symbol) ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 pt-0 bg-muted/20">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Price Chart Placeholder */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Price Chart (7D)</h4>
                          <div className="h-32 bg-card rounded-lg border border-border flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Chart Coming Soon</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Token Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Token Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">24h Change</span>
                                <Badge 
                                  variant={asset.isPositive ? "default" : "destructive"}
                                  className={asset.isPositive ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                                >
                                  {asset.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                  {asset.change24h}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Balance</span>
                                <span className="font-medium">
                                  {balanceVisible ? `${asset.balance} ${asset.symbol}` : "••••••"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">USD Value</span>
                                <span className="font-medium">
                                  {balanceVisible ? asset.usdValue : "••••••"}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">Contract Address</span>
                                <div className="flex items-center space-x-2 p-2 bg-card rounded border">
                                  <code className="text-xs font-mono flex-1 truncate">
                                    {asset.contractAddress}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(asset.contractAddress);
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}