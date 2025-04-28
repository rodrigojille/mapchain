import { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TokenId } from "@hashgraph/sdk";

export class HederaService {
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  constructor(operatorId: string, operatorKey: string) {
    // Initialize Hedera client (testnet by default)
    this.client = Client.forTestnet();
    this.operatorId = AccountId.fromString(operatorId);
    this.operatorKey = PrivateKey.fromString(operatorKey);
    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  async createPropertyNFT(name: string, symbol: string) {
    try {
      // Create NFT with custom fee schedule
      const nftCreate = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(50000)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .freezeWith(this.client);

      const nftCreateTxSign = await nftCreate.sign(this.operatorKey);
      const nftCreateSubmit = await nftCreateTxSign.execute(this.client);
      const nftCreateRx = await nftCreateSubmit.getReceipt(this.client);

      if (!nftCreateRx.tokenId) {
        console.error("NFT creation receipt:", JSON.stringify(nftCreateRx, null, 2));
        throw new Error("Token creation failed: tokenId is undefined. Check your HBAR balance and Hedera network status.");
      }
      console.log("NFT creation receipt (success):", JSON.stringify(nftCreateRx, null, 2));
      return nftCreateRx.tokenId.toString();
    } catch (error) {
      console.error("Error creating NFT:", error);
      if (error && typeof error === 'object') {
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }
      throw error;
    }
  }

  async mintPropertyNFT(tokenId: string, metadata: string) {
    try {
      const mintTx = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setMetadata([Buffer.from(metadata)])
        .freezeWith(this.client);

      const mintTxSign = await mintTx.sign(this.operatorKey);
      const mintTxSubmit = await mintTxSign.execute(this.client);
      const mintRx = await mintTxSubmit.getReceipt(this.client);
      console.log("NFT minting receipt (success):", JSON.stringify(mintRx, null, 2));
      // Return transactionId from the transaction response and serials from the receipt
      return {
        transactionId: mintTxSubmit.transactionId.toString(),
        serials: mintRx.serials || [],
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      if (error && typeof error === 'object') {
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }
      throw error;
    }
  }

  // Add more methods for property management and valuation
}
