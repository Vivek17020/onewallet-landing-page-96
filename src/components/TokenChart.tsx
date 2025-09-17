import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { UnifiedToken } from "@/hooks/usePortfolioData";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { Currency } from "./CurrencySelector";

type ChartPeriod = '24h' | '7d' | '30d';

interface TokenChartProps {
  token: UnifiedToken;
  selectedCurrency: Currency;
}

// Generate mock chart data for different periods
function generateChartData(currentPrice: number, change24h: number, period: ChartPeriod) {
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const data = [];
  
  // Simulate different volatilities for different periods
  const volatility = period === '24h' ? 0.02 : period === '7d' ? 0.05 : 0.08;
  const totalChange = period === '24h' ? change24h : period === '7d' ? change24h * 2.5 : change24h * 8;
  
  const startPrice = currentPrice / (1 + totalChange / 100);
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const randomVariation = (Math.random() - 0.5) * (currentPrice * volatility);
    const trendPrice = startPrice + (currentPrice - startPrice) * progress;
    const price = Math.max(0, trendPrice + randomVariation);
    
    let timeLabel;
    if (period === '24h') {
      timeLabel = `${i.toString().padStart(2, '0')}:00`;
    } else if (period === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      timeLabel = days[i];
    } else {
      timeLabel = `Day ${i + 1}`;
    }
    
    data.push({
      time: timeLabel,
      price: price,
    });
  }
  
  return data;
}

export default function TokenChart({ token, selectedCurrency }: TokenChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('24h');
  const { formatCurrency } = useCurrencyConverter(selectedCurrency);
  
  const chartData = generateChartData(token.price, token.change24h, selectedPeriod);
  
  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    toast.success("Contract address copied to clipboard");
  };
  
  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${token.address}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      {/* Enhanced Token Header */}
      <div className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-card border border-border">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
          {token.logo}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{token.name}</h2>
          <p className="text-muted-foreground">{token.symbol}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(token.price)}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              token.change24h >= 0 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Period Selector */}
      <div className="flex space-x-2">
        {(['24h', '7d', '30d'] as ChartPeriod[]).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="flex-1"
          >
            {period}
          </Button>
        ))}
      </div>

      {/* Enhanced Price Chart */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Price Chart ({selectedPeriod})
        </h3>
        <div className="h-64 w-full p-4 rounded-lg bg-card border border-border">
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
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [formatCurrency(Number(value)), "Price"]}
                  />} 
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 6px hsl(var(--primary) / 0.3))"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Contract Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Contract Information</h3>
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Contract Address</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={openEtherscan}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <code className="text-sm font-mono break-all text-foreground bg-background/50 p-2 rounded block">
            {token.address}
          </code>
        </div>
      </div>

      {/* Token Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Your Balance</div>
          <div className="text-xl font-bold text-foreground">{token.balance} {token.symbol}</div>
          <div className="text-sm text-muted-foreground">{formatCurrency(token.fiatValue)}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
          <div className="text-xl font-bold text-foreground">$0.00</div>
          <div className="text-sm text-muted-foreground">Not available</div>
        </div>
      </div>
    </div>
  );
}