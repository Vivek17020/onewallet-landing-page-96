import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown, RefreshCw, Info, AlertTriangle, Settings } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const tokens = [
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", 
    balance: "2.4567",
    price: 2678.34
  },
  { 
    symbol: "BTC", 
    name: "Bitcoin", 
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", 
    balance: "0.1234",
    price: 44123.67
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", 
    balance: "1,250.00",
    price: 1.00
  },
  { 
    symbol: "MATIC", 
    name: "Polygon", 
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", 
    balance: "456.789",
    price: 0.87
  },
  { 
    symbol: "LINK", 
    name: "Chainlink", 
    icon: "https://cryptologos.cc/logos/chainlink-link-logo.png", 
    balance: "89.123",
    price: 13.45
  },
];

export default function Swap() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const getExchangeRate = () => {
    const fromTokenData = tokens.find(t => t.symbol === fromToken);
    const toTokenData = tokens.find(t => t.symbol === toToken);
    if (!fromTokenData || !toTokenData) return 0;
    return fromTokenData.price / toTokenData.price;
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return "";
    const rate = getExchangeRate();
    return (Number(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      setIsCalculating(true);
      setTimeout(() => {
        setToAmount(calculateToAmount(value));
        setIsCalculating(false);
      }, 300);
    } else {
      setToAmount("");
    }
  };

  const handleConfirmSwap = async () => {
    setIsSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Successful!",
        description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
      });
      
      // Reset form
      setFromAmount("");
      setToAmount("");
      setShowConfirmModal(false);
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "The swap transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    if (fromAmount) {
      const newToAmount = calculateToAmount(fromAmount);
      setToAmount(fromAmount);
      setFromAmount(newToAmount);
    }
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
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="text-right text-lg font-semibold"
                    type="number"
                    step="any"
                  />
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-40 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {tokens.filter(t => t.symbol !== toToken).map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={token.icon} 
                            alt={token.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          <div className="w-5 h-5 bg-gradient-primary rounded-full items-center justify-center text-xs font-semibold text-primary-foreground hidden">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Balance: {tokens.find(t => t.symbol === fromToken)?.balance} {fromToken}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary text-xs"
                  onClick={() => {
                    const balance = tokens.find(t => t.symbol === fromToken)?.balance;
                    if (balance) handleFromAmountChange(balance.replace(',', ''));
                  }}
                >
                  MAX
                </Button>
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
                    value={isCalculating ? "Calculating..." : toAmount}
                    readOnly
                    className="text-right text-lg font-semibold bg-muted/50"
                  />
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-40 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {tokens.filter(t => t.symbol !== fromToken).map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={token.icon} 
                            alt={token.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          <div className="w-5 h-5 bg-gradient-primary rounded-full items-center justify-center text-xs font-semibold text-primary-foreground hidden">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
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

            {/* Exchange Rate & Info */}
            {fromAmount && toAmount && (
              <Card className="bg-muted/30 border border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <div className="text-right">
                      <div className="font-medium">
                        1 {fromToken} = {getExchangeRate().toFixed(6)} {toToken}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ≈ ${tokens.find(t => t.symbol === fromToken)?.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-amber-500">~$12.45</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className="text-green-500">{'<'} 0.1%</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Received</span>
                    <span>{(Number(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Slippage Settings */}
            <Card className="bg-muted/30 border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium text-sm">Slippage Tolerance</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-auto p-1"
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0].map((preset) => (
                    <Button
                      key={preset}
                      variant={slippage === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(preset)}
                      className="flex-1 text-xs"
                    >
                      {preset}%
                    </Button>
                  ))}
                  <div className="flex-1">
                    <Input
                      placeholder="Custom"
                      value={slippage !== 0.1 && slippage !== 0.5 && slippage !== 1.0 ? slippage : ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 50) {
                          setSlippage(value);
                        }
                      }}
                      className="text-center text-xs h-8"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
                
                {showSettings && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Higher slippage increases chance of success but may result in worse prices
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Swap Button */}
            <Button 
              className="w-full" 
              size="lg"
              variant="connect"
              disabled={!fromAmount || !toAmount || isCalculating}
              onClick={() => setShowConfirmModal(true)}
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Swap {fromAmount ? `${fromAmount} ${fromToken}` : 'Tokens'}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Best rates from 1inch, Uniswap & Paraswap</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Swap
            </DialogTitle>
            <DialogDescription>
              Please review your swap details before confirming the transaction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Swap Summary */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={tokens.find(t => t.symbol === fromToken)?.icon} 
                      alt={fromToken}
                      className="w-6 h-6"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="font-semibold">{fromAmount} {fromToken}</span>
                  </div>
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <img 
                      src={tokens.find(t => t.symbol === toToken)?.icon} 
                      alt={toToken}
                      className="w-6 h-6"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="font-semibold">{toAmount} {toToken}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>1 {fromToken} = {getExchangeRate().toFixed(6)} {toToken}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-amber-500">~$12.45</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-green-500">{'<'} 0.1%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Received</span>
                <span>{(Number(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken}</span>
              </div>
              
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total Cost</span>
                <span>${((Number(fromAmount) * (tokens.find(t => t.symbol === fromToken)?.price || 0)) + 12.45).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSwapping}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSwap}
              disabled={isSwapping}
              className="w-full sm:w-auto"
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : (
                `Confirm Swap`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}