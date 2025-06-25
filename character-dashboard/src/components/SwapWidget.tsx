import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAlgorand } from "@/components/evm-provider";
import algosdk from "algosdk";

const SwapWidget = ({ defaultTokenInfo = null }) => {
  const [amount, setAmount] = useState("1"); // Default to 1 token
  const [selectedToken, setSelectedToken] = useState("");
  const [isSelling, setIsSelling] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [availableTokens, setAvailableTokens] = useState([]);

  const { algodClient, indexerClient, account, isConnected } = useAlgorand();

  // Set default token when it becomes available
  useEffect(() => {
    if (defaultTokenInfo?.assetId) {
      setSelectedToken(defaultTokenInfo.assetId.toString());
    }
  }, [defaultTokenInfo]);

  // Fetch available tokens
  useEffect(() => {
    const fetchAvailableTokens = async () => {
      if (!indexerClient || !account) return;

      try {
        // In a real app, you would fetch tokens from the indexer
        // For this example, we'll use mock data
        const mockTokens = [
          {
            assetId: 123456,
            name: "Agent Token",
            unitName: "AGENT",
            total: 1000000,
          },
          {
            assetId: 789012,
            name: "Game Token",
            unitName: "GAME",
            total: 5000000,
          },
        ];

        // If we have a default token, add it to the list if not already present
        if (defaultTokenInfo?.assetId) {
          const exists = mockTokens.some(token => token.assetId === defaultTokenInfo.assetId);
          if (!exists) {
            mockTokens.unshift({
              assetId: defaultTokenInfo.assetId,
              name: defaultTokenInfo.name,
              unitName: defaultTokenInfo.unitName,
              total: defaultTokenInfo.total || 1000000,
            });
          }
        }

        setAvailableTokens(mockTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError("Failed to load available tokens");
      }
    };

    fetchAvailableTokens();
  }, [indexerClient, account, defaultTokenInfo]);

  // Calculate expected output (simplified bonding curve)
  const calculateExpectedOutput = () => {
    if (!selectedToken || !amount) return null;
    
    // Simple linear pricing for demonstration
    const basePrice = 0.001; // 0.001 ALGO per token
    const amountNum = parseFloat(amount);
    
    if (isSelling) {
      // Selling tokens gives 95% of the value (5% fee)
      return (amountNum * basePrice * 0.95).toFixed(6);
    } else {
      // Buying tokens costs 105% of the value (5% fee)
      return (amountNum * basePrice * 1.05).toFixed(6);
    }
  };

  const expectedOutput = calculateExpectedOutput();

  // Handle swap
  const handleSwap = async () => {
    if (!algodClient || !account || !selectedToken || !amount) return;
    
    try {
      setIsLoading(true);
      setError("");

      // In a real app, you would:
      // 1. Create and sign a transaction
      // 2. Submit it to the network
      // 3. Wait for confirmation

      // For this example, we'll simulate a transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transaction hash
      const mockTxHash = "TXID" + Math.random().toString(36).substring(2, 15);
      setTxHash(mockTxHash);
      
      // Reset amount after successful swap
      setAmount("1");
      
    } catch (err) {
      console.error("Swap error:", err);
      setError(err.message || "An error occurred during the swap");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle amount input change with validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || value === "0") {
      setAmount("1");
      return;
    }

    // Ensure it's a valid positive number
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      // Limit to 6 decimal places to prevent overflow
      const limitedValue = Math.min(parsedValue, 1e6);
      setAmount(limitedValue.toString());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSelling ? "Sell" : "Buy"} Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Trading Mode</Label>
            <div className="flex items-center space-x-2">
              <Label>Buy</Label>
              <Switch
                checked={isSelling}
                onCheckedChange={setIsSelling}
                disabled={isLoading}
              />
              <Label>Sell</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Token</Label>
            <Select
              value={selectedToken}
              onValueChange={setSelectedToken}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem
                    key={token.assetId}
                    value={token.assetId.toString()}
                  >
                    {token.name} ({token.unitName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter number of tokens"
              value={amount}
              onChange={handleAmountChange}
              disabled={isLoading}
              step="1"
              min="1"
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Enter the number of tokens you want to trade
            </p>
          </div>

          {expectedOutput && (
            <Alert>
              <AlertTitle>
                Expected {isSelling ? "ALGO Return" : "Cost"}
              </AlertTitle>
              <AlertDescription>
                {expectedOutput} ALGO
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSwap}
            disabled={
              !isConnected ||
              isLoading ||
              !selectedToken ||
              !amount ||
              amount === "0"
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `${isSelling ? "Sell" : "Buy"} Tokens`
            )}
          </Button>

          {txHash && (
            <Alert>
              <AlertTitle>Transaction Sent</AlertTitle>
              <AlertDescription>
                <div className="break-all">{txHash}</div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapWidget;