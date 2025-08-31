import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Shield, Zap, Globe } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import WalletButton from "@/components/WalletButton";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const { isConnected, connectWallet } = useWallet();
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OneWallet
          </span>
        </div>
        <WalletButton />
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Web3 blockchain network visualization" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                One Wallet.
              </span>
              <br />
              <span className="text-foreground">Every Chain.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the future of DeFi with our unified wallet dashboard for multiple chains. 
              Manage all your crypto assets seamlessly in one beautiful interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              {!isConnected ? (
                <Button 
                  variant="connect" 
                  size="lg"
                  className="text-lg px-8 py-4 h-auto min-w-[200px]"
                  onClick={connectWallet}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  size="lg"
                  className="text-lg px-8 py-4 h-auto min-w-[200px]"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Wallet Connected
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 h-auto border-primary/30 hover:border-primary"
              >
                Learn More
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 animate-float">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">Secure & Safe</h3>
                <p className="text-muted-foreground">
                  Industry-leading security with multi-signature support and hardware wallet integration.
                </p>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Execute transactions across multiple chains with optimized routing and minimal fees.
                </p>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 animate-float" style={{ animationDelay: '2s' }}>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Globe className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">Multi-Chain</h3>
                <p className="text-muted-foreground">
                  Support for Ethereum, Polygon, BSC, Solana, and 20+ other major blockchain networks.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;