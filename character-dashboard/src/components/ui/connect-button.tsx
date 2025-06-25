import { Button } from "@/components/ui/button";
import { useAlgorand } from "@/components/evm-provider";

export function ConnectButton() {
  const { account, connectWallet, disconnectWallet, isConnected } = useAlgorand();

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-muted rounded text-xs font-mono">
            {account?.substring(0, 4)}...{account?.substring(account.length - 4)}
          </div>
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}