import algosdk from "algosdk";

// Algorand network configuration
export const ALGORAND_NETWORK = {
  algodToken: "",
  algodServer: "https://testnet-api.algonode.cloud",
  algodPort: "",
  indexerToken: "",
  indexerServer: "https://testnet-idx.algonode.cloud",
  indexerPort: "",
};

// Initialize Algorand clients
export const getAlgodClient = () => {
  return new algosdk.Algodv2(
    ALGORAND_NETWORK.algodToken,
    ALGORAND_NETWORK.algodServer,
    ALGORAND_NETWORK.algodPort
  );
};

export const getIndexerClient = () => {
  return new algosdk.Indexer(
    ALGORAND_NETWORK.indexerToken,
    ALGORAND_NETWORK.indexerServer,
    ALGORAND_NETWORK.indexerPort
  );
};

// Create ASA (Algorand Standard Asset)
export async function createASA(
  client: algosdk.Algodv2,
  creator: algosdk.Account,
  assetName: string,
  unitName: string,
  totalIssuance: number = 1000000,
  decimals: number = 0,
  defaultFrozen: boolean = false,
  url: string = ""
) {
  try {
    // Get suggested parameters
    const suggestedParams = await client.getTransactionParams().do();

    // Create asset creation transaction
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creator.addr,
      total: totalIssuance,
      decimals: decimals,
      assetName: assetName,
      unitName: unitName,
      assetURL: url,
      defaultFrozen: defaultFrozen,
      freeze: creator.addr,
      manager: creator.addr,
      clawback: creator.addr,
      reserve: creator.addr,
      suggestedParams: suggestedParams,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(creator.sk);
    
    // Submit the transaction
    const { txId } = await client.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    
    // Get the asset ID
    const assetId = confirmedTxn["asset-index"];
    
    return {
      assetId,
      txId,
    };
  } catch (error) {
    console.error("Error creating ASA:", error);
    throw error;
  }
}

// Transfer ASA
export async function transferASA(
  client: algosdk.Algodv2,
  sender: algosdk.Account,
  receiver: string,
  assetId: number,
  amount: number
) {
  try {
    // Get suggested parameters
    const suggestedParams = await client.getTransactionParams().do();

    // Create asset transfer transaction
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: receiver,
      assetIndex: assetId,
      amount: amount,
      suggestedParams: suggestedParams,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(sender.sk);
    
    // Submit the transaction
    const { txId } = await client.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(client, txId, 4);
    
    return {
      txId,
    };
  } catch (error) {
    console.error("Error transferring ASA:", error);
    throw error;
  }
}

// Opt-in to ASA
export async function optInToASA(
  client: algosdk.Algodv2,
  account: algosdk.Account,
  assetId: number
) {
  try {
    // Get suggested parameters
    const suggestedParams = await client.getTransactionParams().do();

    // Create asset opt-in transaction
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: suggestedParams,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(account.sk);
    
    // Submit the transaction
    const { txId } = await client.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(client, txId, 4);
    
    return {
      txId,
    };
  } catch (error) {
    console.error("Error opting in to ASA:", error);
    throw error;
  }
}

// Get account information
export async function getAccountInfo(client: algosdk.Algodv2, address: string) {
  try {
    return await client.accountInformation(address).do();
  } catch (error) {
    console.error("Error getting account info:", error);
    throw error;
  }
}

// Get asset information
export async function getAssetInfo(client: algosdk.Algodv2, assetId: number) {
  try {
    return await client.getAssetByID(assetId).do();
  } catch (error) {
    console.error("Error getting asset info:", error);
    throw error;
  }
}