import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { WalletProvider } from "@/contexts/WalletContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import Swap from "./pages/Swap";
import Bridge from "./pages/Bridge";
import History from "./pages/History";
import SettingsPage from "./pages/Settings";
import AppShell from "./components/AppShell";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app/assets" element={<AppShell><ErrorBoundary><Assets /></ErrorBoundary></AppShell>} />
                <Route path="/app/swap" element={<AppShell><ErrorBoundary><Swap /></ErrorBoundary></AppShell>} />
                <Route path="/app/bridge" element={<AppShell><ErrorBoundary><Bridge /></ErrorBoundary></AppShell>} />
                <Route path="/app/history" element={<AppShell><ErrorBoundary><History /></ErrorBoundary></AppShell>} />
                <Route path="/app/settings" element={<AppShell><ErrorBoundary><SettingsPage /></ErrorBoundary></AppShell>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
