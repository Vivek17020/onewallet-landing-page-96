import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Globe, User, Palette } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function SettingsPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to access settings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your OneWallet experience</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
            </div>
            <Button variant="outline">Update Profile</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch id="2fa" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="biometric">Biometric Authentication</Label>
                <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
              </div>
              <Switch id="biometric" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="backup">Backup Phrase</Label>
              <Button variant="outline" className="w-full">
                View Recovery Phrase
              </Button>
              <p className="text-sm text-muted-foreground">
                Store your recovery phrase safely to restore your wallet
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive transaction alerts</p>
              </div>
              <Switch id="push" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of price changes</p>
              </div>
              <Switch id="price-alerts" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="news">News & Updates</Label>
                <p className="text-sm text-muted-foreground">Stay informed about new features</p>
              </div>
              <Switch id="news" />
            </div>
          </CardContent>
        </Card>

        {/* Network Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-network">Default Network</Label>
              <Select defaultValue="ethereum">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gas-price">Gas Price Setting</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (Low Fee)</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fast">Fast (High Fee)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue="dark">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Display Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="btc">BTC (₿)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}