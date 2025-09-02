import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, RefreshCw, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";

const mockTransactions = [
  {
    id: "0x1234...5678",
    type: "swap",
    fromToken: "ETH",
    toToken: "USDC",
    fromAmount: "1.5",
    toAmount: "2,517.45",
    status: "completed",
    timestamp: "2024-09-01T14:30:00Z",
    timeAgo: "2 hours ago",
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    network: "Ethereum",
    fee: "$12.45",
    value: "$4,022.14"
  },
  {
    id: "0x2345...6789",
    type: "send",
    fromToken: "BTC",
    toToken: null,
    fromAmount: "0.05",
    toAmount: null,
    status: "completed",
    timestamp: "2024-09-01T11:30:00Z",
    timeAgo: "5 hours ago",
    hash: "0x2345678901bcdef12345678901bcdef123456789",
    network: "Bitcoin",
    fee: "$8.20",
    value: "$2,206.18"
  },
  {
    id: "0x3456...7890",
    type: "receive",
    fromToken: "MATIC",
    toToken: null,
    fromAmount: "100",
    toAmount: null,
    status: "pending",
    timestamp: "2024-08-31T14:30:00Z",
    timeAgo: "1 day ago",
    hash: "0x3456789012cdef123456789012cdef1234567890",
    network: "Polygon",
    fee: "$0.02",
    value: "$87.00"
  },
  {
    id: "0x4567...8901",
    type: "swap",
    fromToken: "USDC",
    toToken: "ETH",
    fromAmount: "1,000",
    toAmount: "0.596",
    status: "failed",
    timestamp: "2024-08-29T14:30:00Z",
    timeAgo: "3 days ago",
    hash: "0x456789013def12345678903def12345678901",
    network: "Ethereum",
    fee: "$0.00",
    value: "$1,000.00"
  },
  {
    id: "0x5678...9012",
    type: "receive",
    fromToken: "ETH",
    toToken: null,
    fromAmount: "0.25",
    toAmount: null,
    status: "completed",
    timestamp: "2024-08-28T10:15:00Z",
    timeAgo: "4 days ago",
    hash: "0x56789012def123456789012def123456789012",
    network: "Ethereum",
    fee: "$0.00",
    value: "$669.59"
  }
];

export default function History() {
  const { isConnected } = useWallet();
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-muted";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "receive":
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      case "swap":
        return <RefreshCw className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeDisplay = (tx: any) => {
    switch (tx.type) {
      case "swap":
        return `${tx.fromToken} → ${tx.toToken}`;
      case "send":
        return `Send ${tx.fromToken}`;
      case "receive":
        return `Receive ${tx.fromToken}`;
      default:
        return tx.type;
    }
  };

  const filteredTransactions = mockTransactions.filter(tx => {
    const typeMatch = filter === "all" || tx.type === filter;
    const statusMatch = statusFilter === "all" || tx.status === statusFilter;
    return typeMatch && statusMatch;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">Track all your transactions across multiple chains</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((tx) => (
          <Card key={tx.id} className="hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center border border-border/20">
                    {getTypeIcon(tx.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      {getTypeDisplay(tx)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{tx.network}</span>
                      <span>•</span>
                      <span>{tx.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-foreground">
                    {tx.type === "swap" 
                      ? `${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken}`
                      : `${tx.type === "send" ? "-" : "+"}${tx.fromAmount} ${tx.fromToken}`
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tx.value} {tx.fee !== "$0.00" && `• Fee: ${tx.fee}`}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline"
                    className={`${getStatusColor(tx.status)} capitalize font-medium px-3 py-1`}
                  >
                    {tx.status}
                  </Badge>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-9 h-9 hover:bg-muted/80"
                    onClick={() => {
                      const explorerUrl = tx.network === "Bitcoin" 
                        ? `https://blockchair.com/bitcoin/transaction/${tx.hash}`
                        : tx.network === "Polygon"
                        ? `https://polygonscan.com/tx/${tx.hash}`
                        : `https://etherscan.io/tx/${tx.hash}`;
                      window.open(explorerUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="text-xs text-muted-foreground font-mono">
                  Transaction ID: {tx.id}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && mockTransactions.length > 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Matching Transactions</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more transactions
            </p>
          </CardContent>
        </Card>
      )}

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