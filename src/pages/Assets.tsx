import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Send, ArrowUpDown, Copy, X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { usePortfolioData, UnifiedToken } from "@/hooks/usePortfolioData";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CurrencySelector, { Currency } from "@/components/CurrencySelector";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";

export default function Assets() {
  const { 
    tokens, 
    totalValue, 
    portfolio24hChange, 
    isLoading, 
    error, 
    isConnected, 
    address 
  } = usePortfolioData();
  
  const [selectedToken, setSelectedToken] = useState<UnifiedToken | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  
  const { formatCurrency } = useCurrencyConverter(selectedCurrency);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load token prices", {
        description: error,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [error]);


  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleTokenClick = (token: UnifiedToken) => {
    setSelectedToken(token);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your token balances and portfolio value.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load token prices: {error}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to Load Portfolio</h2>
          <p className="text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground">
              Your crypto portfolio overview and token balances
            </p>
          </div>
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="h-8 w-8 p-0"
            >
              {isBalanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isBalanceVisible ? (
                formatCurrency(totalValue)
              ) : (
                "••••••"
              )}
            </div>
            <p className={`text-xs flex items-center ${
              portfolio24hChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {!isLoading && (
                <>
                  {portfolio24hChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(portfolio24hChange)}
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : tokens.length}
            </div>
            <p className="text-xs text-muted-foreground">Different tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ethereum</div>
            <p className="text-xs text-muted-foreground">Mainnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <Button className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
        <Button variant="outline" className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Receive
        </Button>
        <Button variant="outline" className="flex-1">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Swap
        </Button>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>
            All your token balances and their current values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading portfolio...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No tokens found in your wallet
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((token) => (
                  <TableRow 
                    key={token.symbol} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTokenClick(token)}
                  >
                    <TableCell className="flex items-center space-x-3">
                      <div className="text-2xl">{token.logo}</div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-medium">{token.balance}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(token.price)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isBalanceVisible ? formatCurrency(token.fiatValue) : "••••••"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={token.change24h >= 0 ? "default" : "destructive"}
                        className={`${
                          token.change24h >= 0 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {formatPercentage(token.change24h)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Token Detail Drawer */}
      <Drawer open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DrawerContent className="max-h-[85vh]">
          {selectedToken && (
            <>
              <DrawerHeader className="text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{selectedToken.logo}</div>
                    <div>
                      <DrawerTitle className="text-xl">{selectedToken.name}</DrawerTitle>
                      <DrawerDescription>{selectedToken.symbol}</DrawerDescription>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="px-4 pb-6 space-y-6">
                {/* Token Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{selectedToken.balance}</div>
                    <div className="text-sm text-muted-foreground">Balance</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{formatCurrency(selectedToken.price)}</div>
                    <div className="text-sm text-muted-foreground">Price</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{formatCurrency(selectedToken.fiatValue)}</div>
                    <div className="text-sm text-muted-foreground">Value</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className={`text-2xl font-bold ${
                      selectedToken.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(selectedToken.change24h)}
                    </div>
                    <div className="text-sm text-muted-foreground">24h Change</div>
                  </div>
                </div>

                {/* Mini Price Chart */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">24h Price Chart</h3>
                  <div className="h-48 w-full">
                    <ChartContainer
                      config={{
                        price: {
                          label: "Price",
                          color: "hsl(var(--primary))",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedToken.chartData}>
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            domain={['dataMin', 'dataMax']}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-price)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                {/* Contract Address */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Contract Address</h3>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">
                      {selectedToken.address.slice(0, 20)}...{selectedToken.address.slice(-20)}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyAddress(selectedToken.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send {selectedToken.symbol}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Swap {selectedToken.symbol}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}