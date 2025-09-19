import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useChainStore, SUPPORTED_CHAINS, type Chain } from "@/stores/chainStore";

export const ChainSelector = () => {
  const { selectedChain, setSelectedChain } = useChainStore();

  const handleChainChange = (chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id.toString() === chainId);
    if (chain) {
      setSelectedChain(chain);
    }
  };

  return (
    <Select value={selectedChain.id.toString()} onValueChange={handleChainChange}>
      <SelectTrigger className="w-[140px] bg-background/95 backdrop-blur-sm border-border/50 hover:bg-muted/50 transition-colors">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedChain.icon}</span>
            <span className="font-medium text-sm">{selectedChain.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50 z-50">
        {SUPPORTED_CHAINS.map((chain) => (
          <SelectItem 
            key={chain.id} 
            value={chain.id.toString()}
            className="focus:bg-muted/80 cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{chain.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{chain.name}</span>
                <span className="text-xs text-muted-foreground">{chain.symbol}</span>
              </div>
              {chain.id === selectedChain.id && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Active
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};