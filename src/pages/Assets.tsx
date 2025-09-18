import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Send, ArrowUpDown, Copy, X, RefreshCw, AlertCircle, Loader2, Search, ChevronUp, ChevronDown } from "lucide-react";
import { usePortfolioData, UnifiedToken } from "@/hooks/usePortfolioData";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CurrencySelector, { Currency } from "@/components/CurrencySelector";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import TokenChart from "@/components/TokenChart";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'change'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { formatCurrency } = useCurrencyConverter(selectedCurrency);

  // Filter and sort tokens
  const filteredAndSortedTokens = tokens
    .filter(token => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.fiatValue - b.fiatValue;
          break;
        case 'change':
          comparison = a.change24h - b.change24h;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (column: 'name' | 'value' | 'change') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Asset</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Value</span>
                    {sortBy === 'value' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('change')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>24h Change</span>
                    {sortBy === 'change' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
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
              ) : filteredAndSortedTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {tokens.length === 0 ? "No tokens found in your wallet" : "No tokens match your search"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTokens.map((token) => (
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

      {/* Enhanced Token Detail Drawer */}
      <Drawer open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          {selectedToken && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Token Details</h2>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              
              <TokenChart 
                token={selectedToken} 
                selectedCurrency={selectedCurrency}
              />
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send {selectedToken.symbol}
                </Button>
                <Button variant="outline" className="flex-1">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Swap {selectedToken.symbol}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}