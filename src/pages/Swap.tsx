import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, RefreshCw, Info, AlertTriangle, Settings } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { use1inchApi } from "@/hooks/use1inchApi";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { ReviewSwapModal } from "@/components/ReviewSwapModal";

const tokens = [
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", 
    balance: "2.4567",
    price: 2678.34,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH native token
    decimals: 18
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", 
    balance: "1,250.00",
    price: 1.00,
    address: "0xA0b86a33E6441E71de9E6A8669B3aBbEe9B4A6a5",
    decimals: 6
  },
  { 
    symbol: "MATIC", 
    name: "Polygon", 
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", 
    balance: "456.789",
    price: 0.87,
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    decimals: 18
  },
  { 
    symbol: "LINK", 
    name: "Chainlink", 
    icon: "https://cryptologos.cc/logos/chainlink-link-logo.png", 
    balance: "89.123",
    price: 13.45,
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [protocols, setProtocols] = useState<string[]>([]);
  const [gasEstimate, setGasEstimate] = useState<number>(0);
  const [priceImpact, setPriceImpact] = useState<number>(0);

  const { apiKey, saveApiKey, getQuote, getProtocolSummary, calculatePriceImpact, isLoading: isLoadingQuote } = use1inchApi();

  const getExchangeRate = () => {
    const fromTokenData = tokens.find(t => t.symbol === fromToken);
    const toTokenData = tokens.find(t => t.symbol === toToken);
    if (!fromTokenData || !toTokenData) return 0;
    return fromTokenData.price / toTokenData.price;
  };

  const calculateToAmount = async (amount: string) => {
    if (!amount || isNaN(Number(amount))) return "";
    
    if (!apiKey) {
      // Fallback to mock calculation
      const rate = getExchangeRate();
      return (Number(amount) * rate).toFixed(6);
    }

    const fromTokenData = tokens.find(t => t.symbol === fromToken);
    const toTokenData = tokens.find(t => t.symbol === toToken);
    
    if (!fromTokenData || !toTokenData) return "";

    // Convert amount to wei/smallest unit
    const amountInWei = (Number(amount) * Math.pow(10, fromTokenData.decimals)).toString();

    const quote = await getQuote({
      fromTokenAddress: fromTokenData.address,
      toTokenAddress: toTokenData.address,
      amount: amountInWei,
      slippage
    });

    if (quote) {
      setQuoteData(quote);
      setProtocols(getProtocolSummary(quote.protocols));
      setGasEstimate(quote.estimatedGas);
      
      const outputAmount = Number(quote.toTokenAmount) / Math.pow(10, toTokenData.decimals);
      const impact = calculatePriceImpact(amount, outputAmount.toString(), fromTokenData.price, toTokenData.price);
      setPriceImpact(impact);
      
      return outputAmount.toFixed(6);
    }

    // Fallback to mock calculation
    const rate = getExchangeRate();
    return (Number(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    if (value) {
      setIsCalculating(true);
      try {
        const result = await calculateToAmount(value);
        setToAmount(result);
      } catch (error) {
        console.error('Error calculating amount:', error);
        setToAmount("");
      } finally {
        setIsCalculating(false);
      }
    } else {
      setToAmount("");
      setQuoteData(null);
      setProtocols([]);
      setGasEstimate(0);
      setPriceImpact(0);
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
      setQuoteData(null);
      setProtocols([]);
      setGasEstimate(0);
      setPriceImpact(0);
      setShowReviewModal(false);
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

  const handleSwapTokens = async () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    if (fromAmount) {
      setIsCalculating(true);
      try {
        const newToAmount = await calculateToAmount(fromAmount);
        setToAmount(fromAmount);
        setFromAmount(newToAmount);
      } catch (error) {
        console.error('Error swapping tokens:', error);
      } finally {
        setIsCalculating(false);
      }
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-center flex-1">Token Swap</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyModal(true)}
                className="ml-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            {!apiKey && (
              <div className="text-xs text-amber-600 dark:text-amber-400 text-center">
                Set API key for real-time quotes
              </div>
            )}
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
                    <span className={priceImpact > 3 ? "text-red-500" : priceImpact > 1 ? "text-amber-500" : "text-green-500"}>
                      {priceImpact > 0 ? `${priceImpact.toFixed(2)}%` : '< 0.1%'}
                    </span>
                  </div>
                  
                  {gasEstimate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gas Estimate</span>
                      <span>{gasEstimate.toLocaleString()} gas</span>
                    </div>
                  )}
                  
                  {protocols.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route</span>
                      <span className="text-right max-w-32 truncate" title={protocols.join(', ')}>
                        {protocols.slice(0, 2).join(', ')}
                        {protocols.length > 2 && ` +${protocols.length - 2}`}
                      </span>
                    </div>
                  )}
                  
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
              disabled={!fromAmount || !toAmount || isCalculating || isLoadingQuote}
              onClick={() => setShowReviewModal(true)}
            >
              {isCalculating || isLoadingQuote ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isLoadingQuote ? 'Getting quote...' : 'Calculating...'}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {apiKey ? 'Review Swap' : `Swap ${fromAmount ? `${fromAmount} ${fromToken}` : 'Tokens'}`}
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

      {/* Review Swap Modal */}
      <ReviewSwapModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        slippage={slippage}
        priceImpact={priceImpact}
        gasEstimate={gasEstimate}
        protocols={protocols}
        minReceived={(Number(toAmount) * (1 - slippage / 100)).toFixed(6)}
        isSwapping={isSwapping}
        onConfirm={handleConfirmSwap}
        onCancel={() => setShowReviewModal(false)}
      />

      {/* API Key Modal */}
      <ApiKeyInput
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
        isOpen={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
      />
    </div>
  );
}