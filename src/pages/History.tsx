import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, RefreshCw, Filter, TrendingUp, TrendingDown, Settings, Key } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { useSwapStore } from "@/stores/swapStore";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { ApiKeysModal } from "@/components/ApiKeysModal";

export default function History() {
  const { isConnected } = useWallet();
  const { transactions: simulatedTransactions } = useSwapStore();
  const { 
    transactions: realTransactions, 
    isLoading, 
    error, 
    apiKeys, 
    saveApiKey, 
    fetchTransactions,
    hasApiKeys 
  } = useTransactionHistory();
  
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showApiModal, setShowApiModal] = useState(false);
  const [dataSource, setDataSource] = useState<'all' | 'real' | 'simulated'>('all');

  // Combine real and simulated transactions
  const allTransactions = [...realTransactions, ...simulatedTransactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Filter transactions based on data source
  const sourceFilteredTransactions = allTransactions.filter(tx => {
    if (dataSource === 'real') return !tx.tags?.includes('SIMULATED');
    if (dataSource === 'simulated') return tx.tags?.includes('SIMULATED');
    return true; // 'all'
  });

  const handleSaveApiKeys = (etherscan: string, polygonscan: string) => {
    saveApiKey('etherscan', etherscan);
    saveApiKey('polygonscan', polygonscan);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800";
      case "simulated":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800";
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

  const filteredTransactions = sourceFilteredTransactions.filter(tx => {
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
          <p className="text-muted-foreground">
            Track transactions across multiple chains • {filteredTransactions.length} transactions
            {!hasApiKeys && " • Add API keys to see real blockchain data"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            {hasApiKeys ? 'Update' : 'Add'} API Keys
          </Button>
          
          {hasApiKeys && (
            <Button
              variant="outline"
              onClick={fetchTransactions}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={dataSource} onValueChange={(value: any) => setDataSource(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Data Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="real">Real Only</SelectItem>
            <SelectItem value="simulated">Simulated Only</SelectItem>
          </SelectContent>
        </Select>
        
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
              <SelectItem value="simulated">Simulated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ExternalLink className="w-4 h-4" />
              <span className="font-medium">API Error</span>
            </div>
            <p className="text-sm mt-1 text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching transaction history from blockchain explorers...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Type</th>
                <th className="text-left p-4 font-semibold text-sm">Token</th>
                <th className="text-right p-4 font-semibold text-sm">Amount</th>
                <th className="text-left p-4 font-semibold text-sm">Chain</th>
                <th className="text-left p-4 font-semibold text-sm">Timestamp</th>
                <th className="text-center p-4 font-semibold text-sm">Status</th>
                <th className="text-center p-4 font-semibold text-sm">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr key={tx.id} className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center border border-border/20">
                        {getTypeIcon(tx.type)}
                      </div>
                      <span className="capitalize font-medium">{tx.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      {tx.type === "swap" 
                        ? `${tx.fromToken} → ${tx.toToken}`
                        : tx.fromToken
                      }
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-semibold">
                      {tx.type === "swap" 
                        ? `${tx.fromAmount} → ${tx.toAmount}`
                        : `${tx.type === "send" ? "-" : "+"}${tx.fromAmount}`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.value}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{tx.network}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium">{tx.timeAgo}</div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(tx.status)} capitalize font-medium px-2 py-1 text-xs`}
                      >
                        {tx.status}
                      </Badge>
                      {tx.tags?.includes('SIMULATED') && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          SIM
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="w-8 h-8 hover:bg-muted/80"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && allTransactions.length > 0 && (
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

      {allTransactions.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground">
              {hasApiKeys 
                ? "No transaction history found for this address"
                : "Your transaction history will appear here. Add API keys to fetch real blockchain data."
              }
            </p>
            {!hasApiKeys && (
              <Button 
                onClick={() => setShowApiModal(true)}
                className="mt-4"
                variant="outline"
              >
                <Key className="w-4 h-4 mr-2" />
                Add API Keys
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys Modal */}
      <ApiKeysModal
        open={showApiModal}
        onOpenChange={setShowApiModal}
        etherscanKey={apiKeys.etherscan}
        polygonscanKey={apiKeys.polygonscan}
        onSaveKeys={handleSaveApiKeys}
      />
    </div>
  );
}