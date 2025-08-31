import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, RefreshCw, Info } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";

const tokens = [
  { symbol: "ETH", name: "Ethereum", icon: "⟠", balance: "2.4567" },
  { symbol: "BTC", name: "Bitcoin", icon: "₿", balance: "0.1234" },
  { symbol: "USDC", name: "USD Coin", icon: "💰", balance: "1,250.00" },
  { symbol: "MATIC", name: "Polygon", icon: "🟣", balance: "456.789" },
];

export default function Swap() {
  const { isConnected } = useWallet();
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ArrowUpDown className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to start swapping tokens
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Swap</h1>
        <p className="text-muted-foreground">Exchange tokens across multiple chains with best rates</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-secondary border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Token Swap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <Label htmlFor="from-amount">From</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="from-amount"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-right text-lg font-semibold"
                  />
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center space-x-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                Balance: {tokens.find(t => t.symbol === fromToken)?.balance} {fromToken}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="rounded-full bg-background hover:bg-muted"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label htmlFor="to-amount">To</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="to-amount"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="text-right text-lg font-semibold"
                  />
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center space-x-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                Balance: {tokens.find(t => t.symbol === toToken)?.balance} {toToken}
              </div>
            </div>

            {/* Swap Info */}
            <Card className="bg-muted/50 border-0">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span>1 {fromToken} = 1,678.34 {toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~$12.45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className="text-green-500">0.05%</span>
                </div>
              </CardContent>
            </Card>

            {/* Swap Button */}
            <Button 
              className="w-full" 
              size="lg"
              variant="connect"
              disabled={!fromAmount || !toAmount}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Swap Tokens
            </Button>

            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Powered by 1inch & 0x aggregators</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}