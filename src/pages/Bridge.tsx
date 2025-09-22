import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Loader2, ExternalLink, Clock, DollarSign, Zap, HelpCircle } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSocketBridge } from "@/hooks/useSocketBridge";
import { SUPPORTED_CHAINS } from "@/stores/chainStore";
import { ValidatedInput, ValidationRules } from "@/components/ValidatedInput";
import { RetryableApiCall } from "@/components/RetryableApiCall";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BridgeQuote {
  routeId: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedTime: string;
  gasFees: string;
  bridgeFee: string;
  totalFee: string;
  protocol: string;
  steps: Array<{
    protocol: string;
    fromChain: string;
    toChain: string;
    estimatedTime: string;
  }>;
}

const POPULAR_TOKENS = [
  { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
  { symbol: "USDC", name: "USD Coin", address: "0xa0b86a33e6ba7f9bd83b9b9e2b9d9ed5b8a3b8c9" },
  { symbol: "USDT", name: "Tether USD", address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
];

export default function Bridge() {
  const { isConnected } = useWallet();
  const [fromChain, setFromChain] = useState("");
  const [toChain, setToChain] = useState("");
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [quotes, setQuotes] = useState<BridgeQuote[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { fetchQuotes, isLoading, error } = useSocketBridge();

  const handleGetQuotes = async () => {
    if (!fromChain || !toChain || !token || !amount || !isFormValid) {
      return;
    }

    const quotesData = await fetchQuotes({
      fromChainId: fromChain,
      toChainId: toChain,
      fromTokenAddress: token,
      toTokenAddress: token, // Same token for simplicity
      fromAmount: amount,
    });

    if (quotesData) {
      setQuotes(quotesData);
    }
  };

  const handleRetryQuotes = () => {
    handleGetQuotes();
  };

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to bridge tokens across different chains
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Cross-Chain Bridge</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Transfer tokens seamlessly across different blockchain networks
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Bridge Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* From Chain */}
            <div className="space-y-2">
              <Label htmlFor="fromChain">From Chain</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{chain.icon}</span>
                        <span>{chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapChains}
                className="rounded-full"
                disabled={!fromChain || !toChain}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* To Chain */}
            <div className="space-y-2">
              <Label htmlFor="toChain">To Chain</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.filter(chain => chain.id.toString() !== fromChain).map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{chain.icon}</span>
                        <span>{chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token to bridge" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_TOKENS.map((tokenOption) => (
                    <SelectItem key={tokenOption.symbol} value={tokenOption.address}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tokenOption.symbol}</span>
                        <span className="text-muted-foreground text-sm">{tokenOption.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                Amount
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the amount of tokens you want to bridge between chains</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <ValidatedInput
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
                validationRules={[
                  ValidationRules.required('Amount is required'),
                  ValidationRules.positiveNumber('Amount must be greater than 0'),
                  ValidationRules.range(0.000001, 1000000, 'Amount must be between 0.000001 and 1,000,000'),
                ]}
                onValidationChange={(isValid) => setIsFormValid(isValid)}
                aria-label={`Enter amount of tokens to bridge`}
              />
            </div>
          </div>

          <RetryableApiCall 
            error={error} 
            isLoading={isLoading}
            onRetry={handleRetryQuotes}
          >
            <Button 
              onClick={handleGetQuotes}
              disabled={!fromChain || !toChain || !token || !amount || !isFormValid || isLoading}
              className="w-full"
              size="lg"
              aria-label="Get bridge quotes for token transfer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Bridge Quotes...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Get Bridge Quotes
                </>
              )}
            </Button>
          </RetryableApiCall>
        </CardContent>
      </Card>

        {/* Bridge Quotes */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Getting Bridge Quotes...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ) : quotes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Bridge Quotes ({quotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {quotes.map((quote, index) => (
              <Card key={quote.routeId || index} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{quote.protocol}</Badge>
                      <Badge variant="outline" className="text-xs">
                        Route {index + 1}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{quote.toAmount} {quote.toToken}</div>
                      <div className="text-sm text-muted-foreground">You'll receive</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{quote.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Fee: {quote.totalFee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{quote.steps.length} step(s)</span>
                    </div>
                  </div>

                  {quote.steps.length > 1 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Route Steps:</div>
                        <div className="flex flex-wrap gap-2">
                          {quote.steps.map((step, stepIndex) => (
                            <Badge key={stepIndex} variant="outline" className="text-xs">
                              {step.protocol}: {step.fromChain} → {step.toChain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    disabled
                  >
                    Execute Bridge (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            ))}
            </CardContent>
          </Card>
        ) : null}

      {quotes.length === 0 && !isLoading && fromChain && toChain && token && amount && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Quotes Available</h3>
            <p className="text-muted-foreground">
              No bridge routes found for the selected configuration. Try different chains or tokens.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}