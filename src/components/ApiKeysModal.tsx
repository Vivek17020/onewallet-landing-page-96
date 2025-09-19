import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Key, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etherscanKey: string;
  polygonscanKey: string;
  onSaveKeys: (etherscan: string, polygonscan: string) => void;
}

export function ApiKeysModal({
  open,
  onOpenChange,
  etherscanKey,
  polygonscanKey,
  onSaveKeys,
}: ApiKeysModalProps) {
  const [localEtherscanKey, setLocalEtherscanKey] = useState(etherscanKey);
  const [localPolygonscanKey, setLocalPolygonscanKey] = useState(polygonscanKey);

  const handleSave = () => {
    onSaveKeys(localEtherscanKey, localPolygonscanKey);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Blockchain API Configuration
          </DialogTitle>
          <DialogDescription>
            Set up API keys to fetch real transaction history from Ethereum and Polygon networks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Privacy Note:</strong> API keys are stored locally in your browser and never sent to our servers.
              They are only used to fetch your transaction history directly from blockchain explorers.
            </AlertDescription>
          </Alert>

          {/* Etherscan Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">E</span>
                  </div>
                  Etherscan API Key
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://etherscan.io/apis', '_blank')}
                  className="h-8"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get Key
                </Button>
              </CardTitle>
              <CardDescription>
                Required to fetch Ethereum mainnet transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="etherscan-key">API Key</Label>
                <Input
                  id="etherscan-key"
                  type="password"
                  placeholder="Enter your Etherscan API key"
                  value={localEtherscanKey}
                  onChange={(e) => setLocalEtherscanKey(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Polygonscan Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">P</span>
                  </div>
                  Polygonscan API Key
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://polygonscan.com/apis', '_blank')}
                  className="h-8"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get Key
                </Button>
              </CardTitle>
              <CardDescription>
                Required to fetch Polygon network transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="polygonscan-key">API Key</Label>
                <Input
                  id="polygonscan-key"
                  type="password"
                  placeholder="Enter your Polygonscan API key"
                  value={localPolygonscanKey}
                  onChange={(e) => setLocalPolygonscanKey(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">How to get API keys:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Visit Etherscan.io or Polygonscan.com</li>
                  <li>Create a free account</li>
                  <li>Navigate to API-Keys section</li>
                  <li>Generate a new API key</li>
                  <li>Copy and paste it here</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save API Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}