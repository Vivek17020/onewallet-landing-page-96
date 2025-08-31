import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const mockTransactions = [
  {
    id: "0x1234...5678",
    type: "swap",
    fromToken: "ETH",
    toToken: "USDC",
    fromAmount: "1.5",
    toAmount: "2,517.45",
    status: "completed",
    timestamp: "2 hours ago",
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    network: "Ethereum"
  },
  {
    id: "0x2345...6789",
    type: "send",
    fromToken: "BTC",
    toToken: null,
    fromAmount: "0.05",
    toAmount: null,
    status: "completed",
    timestamp: "5 hours ago",
    hash: "0x2345678901bcdef12345678901bcdef123456789",
    network: "Bitcoin"
  },
  {
    id: "0x3456...7890",
    type: "receive",
    fromToken: "MATIC",
    toToken: null,
    fromAmount: "100",
    toAmount: null,
    status: "pending",
    timestamp: "1 day ago",
    hash: "0x3456789012cdef123456789012cdef1234567890",
    network: "Polygon"
  },
  {
    id: "0x4567...8901",
    type: "swap",
    fromToken: "USDC",
    toToken: "ETH",
    fromAmount: "1,000",
    toAmount: "0.596",
    status: "failed",
    timestamp: "3 days ago",
    hash: "0x456789013def12345678903def12345678901",
    network: "Ethereum"
  }
];

export default function History() {
  const { isConnected } = useWallet();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "receive":
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case "swap":
        return <div className="w-4 h-4 bg-primary rounded-full" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view your transaction history
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
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">Track all your transactions across multiple chains</p>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((tx) => (
          <Card key={tx.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {getTypeIcon(tx.type)}
                  </div>
                  
                  <div>
                    <div className="font-semibold capitalize">
                      {tx.type}
                      {tx.type === "swap" && ` ${tx.fromToken} → ${tx.toToken}`}
                      {tx.type === "send" && ` ${tx.fromToken}`}
                      {tx.type === "receive" && ` ${tx.fromToken}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.network} • {tx.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {tx.type === "swap" 
                      ? `${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken}`
                      : `${tx.fromAmount} ${tx.fromToken}`
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tx.id}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(tx.status)}
                  >
                    {tx.status}
                  </Badge>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockTransactions.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground">
              Your transaction history will appear here once you start using OneWallet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}