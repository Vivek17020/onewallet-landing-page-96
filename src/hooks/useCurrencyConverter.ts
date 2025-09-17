import { useState, useEffect } from 'react';
import { Currency } from '@/components/CurrencySelector';

// Simple USD to INR conversion rate (in real app, this would come from an API)
const USD_TO_INR_RATE = 83.5; // Approximate current rate

export const useCurrencyConverter = (selectedCurrency: Currency) => {
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    if (selectedCurrency === 'INR') {
      setExchangeRate(USD_TO_INR_RATE);
    } else {
      setExchangeRate(1);
    }
  }, [selectedCurrency]);

  const convertCurrency = (usdAmount: number): number => {
    return usdAmount * exchangeRate;
  };

  const formatCurrency = (amount: number): string => {
    const convertedAmount = convertCurrency(amount);
    
    if (selectedCurrency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    }
  };

  return {
    convertCurrency,
    formatCurrency,
    exchangeRate,
  };
};