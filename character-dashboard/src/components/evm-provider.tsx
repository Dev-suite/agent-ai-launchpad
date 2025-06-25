import { createContext, useContext, useState, useEffect } from "react";
import algosdk from "algosdk";

// Define the context type
interface AlgorandContextType {
  algodClient: algosdk.Algodv2 | null;
  indexerClient: algosdk.Indexer | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

// Create the context with default values
const AlgorandContext = createContext<AlgorandContextType>({
  algodClient: null,
  indexerClient: null,
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
});

// Hook to use the Algorand context
export const useAlgorand = () => useContext(AlgorandContext);

// Provider component
export const AlgorandProvider = ({ children }: { children: React.ReactNode }) => {
  const [algodClient, setAlgodClient] = useState<algosdk.Algodv2 | null>(null);
  const [indexerClient, setIndexerClient] = useState<algosdk.Indexer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Algorand clients
  useEffect(() => {
    // For testnet
    const algodServer = "https://testnet-api.algonode.cloud";
    const algodPort = "";
    const algodToken = "";
    
    const indexerServer = "https://testnet-idx.algonode.cloud";
    const indexerPort = "";
    const indexerToken = "";

    const algodClientInstance = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    const indexerClientInstance = new algosdk.Indexer(indexerToken, indexerServer, indexerPort);

    setAlgodClient(algodClientInstance);
    setIndexerClient(indexerClientInstance);
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      // In a real app, you would use a wallet connector like MyAlgo, WalletConnect, etc.
      // For this example, we'll simulate a connection with a mock account
      const mockAccount = "MOCK" + algosdk.generateAccount().addr.substring(4);
      setAccount(mockAccount);
      setIsConnected(true);
      console.log("Connected to wallet:", mockAccount);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    console.log("Disconnected from wallet");
  };

  const value = {
    algodClient,
    indexerClient,
    account,
    connectWallet,
    disconnectWallet,
    isConnected,
  };

  return (
    <AlgorandContext.Provider value={value}>
      {children}
    </AlgorandContext.Provider>
  );
};

// Renamed for backward compatibility
export const EVMProvider = AlgorandProvider;