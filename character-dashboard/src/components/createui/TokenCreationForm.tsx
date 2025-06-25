import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAlgorand } from "@/components/evm-provider";
import algosdk from "algosdk";

interface TokenData {
  assetId: number;
  name: string;
  unitName: string;
  total: number;
  url: string;
  txId: string;
}

interface TokenFormProps {
  onTokenCreated: (tokenData: TokenData) => void;
  characterName: string;
}

export function TokenCreationForm({
  onTokenCreated,
  characterName,
}: TokenFormProps) {
  const [formData, setFormData] = useState({
    name: `${characterName} Token`,
    unitName: characterName.slice(0, 4).toUpperCase(),
    total: 1000000,
    decimals: 0,
    url: "",
    description: `Token for ${characterName}`,
  });

  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  
  const { algodClient, account, isConnected } = useAlgorand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected || !account) {
      setError("Please connect your wallet.");
      return;
    }

    if (!formData.name || !formData.unitName) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsPending(true);

      // In a real app, you would:
      // 1. Create and sign a transaction to create an ASA
      // 2. Submit it to the network
      // 3. Wait for confirmation

      // For this example, we'll simulate a transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock transaction data
      const mockTxId = "TXID" + Math.random().toString(36).substring(2, 15);
      const mockAssetId = Math.floor(Math.random() * 10000000);
      
      setTxId(mockTxId);

      // Create token data object
      const tokenData: TokenData = {
        assetId: mockAssetId,
        name: formData.name,
        unitName: formData.unitName,
        total: formData.total,
        url: formData.url,
        txId: mockTxId,
      };

      // Call the callback with the token data
      onTokenCreated(tokenData);
      
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Transaction failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Character Token</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Character Token"
              required
              maxLength={50}
              disabled={isPending}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitName">Token Symbol</Label>
            <Input
              id="unitName"
              value={formData.unitName}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData((prev) => ({ ...prev, unitName: value }));
              }}
              placeholder="TKN"
              required
              maxLength={8}
              className="uppercase bg-background"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 8 characters for Algorand ASAs
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total Supply</Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, total: parseInt(e.target.value) }))
              }
              placeholder="1000000"
              required
              min="1"
              max="1000000000"
              className="bg-background"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Token URL (Optional)</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://..."
              type="url"
              className="bg-background"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your character token..."
              required
              maxLength={200}
              className="bg-background"
              disabled={isPending}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {txId && (
            <Alert>
              <AlertTitle>Transaction Submitted</AlertTitle>
              <AlertDescription>
                <div className="break-all">Transaction ID: {txId}</div>
              </AlertDescription>
            </Alert>
          )}

          {isConnected && (
            <Alert>
              <AlertTitle>Network Costs</AlertTitle>
              <AlertDescription>
                <div>Creating an Algorand Standard Asset (ASA) requires:</div>
                <div>- Minimum balance: 0.1 ALGO per asset</div>
                <div>- Transaction fee: ~0.001 ALGO</div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!isConnected || isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Token...
              </>
            ) : (
              "Create Token"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}