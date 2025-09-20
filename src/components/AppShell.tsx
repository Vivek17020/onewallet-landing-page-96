import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Wallet } from "lucide-react";
import WalletButton from "@/components/WalletButton";
import { ChainSelector } from "@/components/ChainSelector";
import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current tab from pathname
  const currentTab = location.pathname.split('/app/')[1] || 'assets';
  
  const handleTabChange = (value: string) => {
    navigate(`/app/${value}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="hover:bg-muted lg:hidden" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:inline">
                  OneWallet
                </span>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent sm:hidden">
                  OW
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ChainSelector />
              <WalletButton />
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="border-b border-border bg-card/30 px-4 lg:px-6">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex bg-muted/50">
                <TabsTrigger 
                  value="assets" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground text-xs sm:text-sm"
                >
                  Assets
                </TabsTrigger>
                <TabsTrigger 
                  value="swap" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground text-xs sm:text-sm"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger 
                  value="bridge" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground text-xs sm:text-sm"
                >
                  Bridge
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground text-xs sm:text-sm"
                >
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground text-xs sm:text-sm"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}