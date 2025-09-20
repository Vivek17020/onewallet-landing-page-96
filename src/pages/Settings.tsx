import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, DollarSign, Palette, User, Wallet, Shield, LogOut } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { AuthModal } from "@/components/AuthModal";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { isConnected, account } = useWallet();
  const { user, settings, isLoading, isSaving, updateSettings, signOut, isAuthenticated } = useUserSettings();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = async (key: string, value: any) => {
    await updateSettings({ [key]: value });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your wallet preferences and notification settings
        </p>
      </div>

      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account & Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Signed in as</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                  {isConnected && account && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Wallet: {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Your settings are automatically saved to your account and synced across devices.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-dashed rounded-lg text-center">
                <div className="text-muted-foreground mb-3">
                  Sign in to save your settings and receive notifications
                </div>
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In / Create Account
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Without an account, your settings will only be saved locally and may be lost.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important events
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => handleSettingChange('notifications_enabled', checked)}
              disabled={isLoading || isSaving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for transactions and updates
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-amber-600">Sign in required for email notifications</p>
              )}
            </div>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications && isAuthenticated}
              onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              disabled={isLoading || isSaving || !isAuthenticated || !settings.notifications_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new transactions are detected
              </p>
            </div>
            <Switch
              id="transaction-alerts"
              checked={settings.transaction_alerts}
              onCheckedChange={(checked) => handleSettingChange('transaction_alerts', checked)}
              disabled={isLoading || isSaving || !settings.notifications_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="price-alerts">Price Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for significant price changes
              </p>
            </div>
            <Switch
              id="price-alerts"
              checked={settings.price_alerts}
              onCheckedChange={(checked) => handleSettingChange('price_alerts', checked)}
              disabled={isLoading || isSaving || !settings.notifications_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Display & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme" className="flex items-center gap-2">
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select 
              value={settings.theme} 
              onValueChange={(value) => handleSettingChange('theme', value)}
              disabled={isLoading || isSaving}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Default Currency
              </Label>
              <p className="text-sm text-muted-foreground">
                Display prices in your preferred currency
              </p>
            </div>
            <Select 
              value={settings.default_currency} 
              onValueChange={(value) => handleSettingChange('default_currency', value)}
              disabled={isLoading || isSaving}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="font-medium">Wallet Connection</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isConnected 
                ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}`
                : "No wallet connected"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Your wallet connection is handled securely by your browser. We never store your private keys.
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Data Privacy:</strong></p>
            <ul className="space-y-1 text-xs ml-4">
              <li>• Settings are stored securely when you have an account</li>
              <li>• Transaction data is fetched from public blockchain APIs</li>
              <li>• Email notifications require account creation</li>
              <li>• We never access your private keys or funds</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Demo Transaction Notification */}
      {isAuthenticated && settings.email_notifications && settings.transaction_alerts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Demo Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                if (!user) return;
                
                try {
                  const { data, error } = await supabase.functions.invoke('send-transaction-notification', {
                    body: {
                      user_id: user.id,
                      transaction_hash: '0x1234567890abcdef1234567890abcdef12345678',
                      transaction_type: 'receive',
                      amount: '0.05',
                      token_symbol: 'ETH',
                      chain: 'Ethereum',
                      to_address: account || '0x...',
                    }
                  });

                  if (error) throw error;

                  toast({
                    title: 'Demo notification sent!',
                    description: 'Check the browser console for the demo email content.',
                  });
                } catch (error: any) {
                  toast({
                    title: 'Failed to send demo notification',
                    description: error.message,
                    variant: 'destructive',
                  });
                }
              }}
              disabled={isSaving}
              variant="outline"
              className="w-full"
            >
              Send Demo Email Notification
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will log a demo email notification to the console (no actual email sent in demo mode).
            </p>
          </CardContent>
        </Card>
      )}

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        walletAddress={account}
      />
    </div>
  );
}