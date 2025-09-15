import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Send, ArrowUpDown } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";
import { useBalances } from "@/hooks/useBalances";
import { useState } from "react";

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  fiatValue: number;
  change24h: number;
  price: number;
}

const mockTokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    logo: "🔷",
    balance: "2.4567",
    fiatValue: 6234.89,
    change24h: 3.45,
    price: 2540.12,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "🔵",
    balance: "1,250.00",
    fiatValue: 1250.00,
    change24h: 0.01,
    price: 1.00,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    logo: "🦄",
    balance: "45.123",
    fiatValue: 567.82,
    change24h: -2.18,
    price: 12.59,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    logo: "🔗",
    balance: "28.5",
    fiatValue: 485.25,
    change24h: 5.67,
    price: 17.03,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    logo: "👻",
    balance: "3.789",
    fiatValue: 341.01,
    change24h: -1.23,
    price: 89.99,
  },
];

const Assets = () => {
  const { address, isConnected, totalUsdValue } = useWalletStore();
  const { nativeBalance, isLoading } = useBalances();
  const [hideBalances, setHideBalances] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const totalPortfolioValue = mockTokens.reduce((sum, token) => sum + token.fiatValue, 0);

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your asset portfolio and balances.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideBalances ? "••••••" : formatCurrency(totalPortfolioValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {mockTokens.length} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+2.3%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hideBalances ? "••••" : "+$142.67"} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Network</CardTitle>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ethereum</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mainnet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button className="flex-1 min-w-[120px]">
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]">
          <Plus className="w-4 h-4 mr-2" />
          Receive
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Swap
        </Button>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>
            View and manage your token portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">24h Change</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTokens.map((token) => (
                  <TableRow key={token.symbol} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{token.logo}</div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground">{token.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {hideBalances ? "••••••" : token.balance}
                      </div>
                      <div className="text-sm text-muted-foreground">{token.symbol}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {hideBalances ? "••••••" : formatCurrency(token.fiatValue)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={token.change24h >= 0 ? "default" : "destructive"}
                        className={`${
                          token.change24h >= 0 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" 
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {token.change24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{formatPercentage(token.change24h)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatCurrency(token.price)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets;