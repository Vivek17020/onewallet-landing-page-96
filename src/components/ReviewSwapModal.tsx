import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info, ArrowRight, RefreshCw } from "lucide-react";

interface ReviewSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  priceImpact: number;
  gasEstimate: number;
  protocols: string[];
  minReceived: string;
  isSwapping: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReviewSwapModal({
  open,
  onOpenChange,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  slippage,
  priceImpact,
  gasEstimate,
  protocols,
  minReceived,
  isSwapping,
  onConfirm,
  onCancel,
}: ReviewSwapModalProps) {
  const getRiskLevel = (impact: number) => {
    if (impact > 5) return { level: "High", color: "text-red-500", icon: AlertTriangle };
    if (impact > 2) return { level: "Medium", color: "text-amber-500", icon: AlertTriangle };
    return { level: "Low", color: "text-green-500", icon: Info };
  };

  const risk = getRiskLevel(priceImpact);
  const RiskIcon = risk.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Review Swap
          </DialogTitle>
          <DialogDescription>
            Please review the swap details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Swap Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold">{fromAmount}</div>
                  <div className="text-sm text-muted-foreground">{fromToken}</div>
                </div>
                <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                <div className="text-center flex-1">
                  <div className="text-lg font-bold">{toAmount}</div>
                  <div className="text-sm text-muted-foreground">{toToken}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Minimum Received</span>
                <span className="font-medium">{minReceived} {toToken}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price Impact</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${risk.color}`}>
                    {priceImpact > 0 ? `${priceImpact.toFixed(2)}%` : '< 0.1%'}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <RiskIcon className={`w-4 h-4 ${risk.color}`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <div className="font-medium mb-1">Risk Level: {risk.level}</div>
                          <div className="text-xs">
                            {priceImpact > 5 && "High price impact may result in significant losses"}
                            {priceImpact > 2 && priceImpact <= 5 && "Moderate price impact - proceed with caution"}
                            {priceImpact <= 2 && "Low price impact - safe to proceed"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage}%</span>
              </div>

              {gasEstimate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Gas</span>
                  <span className="font-medium">{gasEstimate.toLocaleString()}</span>
                </div>
              )}

              <Separator />

              {/* Route Details */}
              {protocols.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route via</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <div className="font-medium mb-1">DEX Aggregation</div>
                            <div className="text-xs">
                              Your swap will be executed across multiple DEXs to get the best rate
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {protocols.slice(0, 3).map((protocol, index) => (
                      <span
                        key={protocol}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium"
                      >
                        {protocol}
                      </span>
                    ))}
                    {protocols.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        +{protocols.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Warning */}
          {priceImpact > 3 && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-red-700 dark:text-red-400">High Price Impact Warning</div>
                    <div className="text-sm text-red-600 dark:text-red-300">
                      This swap has a high price impact of {priceImpact.toFixed(2)}%. You may receive significantly less than expected.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSwapping}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isSwapping}
            className="min-w-24"
          >
            {isSwapping ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              'Confirm Swap'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}