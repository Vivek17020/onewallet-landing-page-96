import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export type Currency = 'USD' | 'INR';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const currencySymbols = {
  USD: '$',
  INR: '₹'
};

export default function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 bg-card border-border">
          <span className="text-foreground">{currencySymbols[selectedCurrency]} {selectedCurrency}</span>
          <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-24 bg-popover border-border shadow-elevated"
      >
        <DropdownMenuItem 
          onClick={() => onCurrencyChange('USD')}
          className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          $ USD
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCurrencyChange('INR')}
          className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          ₹ INR
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}