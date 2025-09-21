import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RetryableApiCallProps {
  children: React.ReactNode;
  onRetry: () => Promise<void> | void;
  error?: string | null;
  isLoading?: boolean;
  maxRetries?: number;
  showRetryButton?: boolean;
}

export const RetryableApiCall: React.FC<RetryableApiCallProps> = ({
  children,
  onRetry,
  error,
  isLoading = false,
  maxRetries = 3,
  showRetryButton = true,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      toast({
        title: "Maximum retries reached",
        description: "Please try again later or check your connection.",
        variant: "destructive",
      });
      return;
    }

    setIsRetrying(true);
    try {
      await onRetry();
      setRetryCount(0);
      toast({
        title: "Retry successful",
        description: "The operation completed successfully.",
      });
    } catch (err) {
      setRetryCount(prev => prev + 1);
      console.error('Retry failed:', err);
      toast({
        title: "Retry failed",
        description: retryCount + 1 >= maxRetries 
          ? "Maximum retries reached. Please try again later." 
          : `Retry ${retryCount + 1}/${maxRetries} failed. Trying again...`,
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const isOnline = navigator.onLine;

  if (error && !isLoading) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isOnline ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <WifiOff className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="font-medium text-destructive">
                {isOnline ? 'API Error' : 'Connection Error'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isOnline ? error : 'Please check your internet connection and try again.'}
              </div>
              {showRetryButton && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying || retryCount >= maxRetries}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying 
                      ? 'Retrying...' 
                      : retryCount >= maxRetries 
                        ? 'Max retries reached' 
                        : `Retry${retryCount > 0 ? ` (${retryCount}/${maxRetries})` : ''}`
                    }
                  </Button>
                  {!isOnline && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

// Hook for API retry logic
export const useRetryableApi = <T,>(
  apiCall: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    onError, 
    onSuccess 
  } = options;

  const execute = async (attempt = 0): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      setRetryCount(0);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error(`API call failed (attempt ${attempt + 1}):`, error);
      
      if (attempt < maxRetries) {
        setRetryCount(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        return execute(attempt + 1);
      } else {
        setError(error.message);
        onError?.(error);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => execute();

  return {
    data,
    error,
    isLoading,
    retryCount,
    execute,
    retry,
  };
};