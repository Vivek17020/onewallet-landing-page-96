import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
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
    icon: "⟠"
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.1234",
    usdValue: "$5,432.10",
    change24h: "-2.34%",
    isPositive: false,
    icon: "₿"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "1,250.00",
    usdValue: "$1,250.00",
    change24h: "+0.01%",
    isPositive: true,
    icon: "💰"
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    balance: "456.789",
    usdValue: "$367.03",
    change24h: "+12.45%",
    isPositive: true,
    icon: "🟣"
  }
];

export default function Assets() {
  const { isConnected, account } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  const totalValue = "$11,172.58";

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
      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Assets</h2>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>

        <div className="grid gap-4">
          {mockAssets.map((asset) => (
            <Card key={asset.symbol} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-xl">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {balanceVisible ? asset.balance : "••••"} {asset.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {balanceVisible ? asset.usdValue : "••••••"}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={asset.isPositive ? "default" : "destructive"}
                      className={asset.isPositive ? "bg-green-500/10 text-green-500" : ""}
                    >
                      {asset.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {asset.change24h}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}