import { 
  Client, 
  AccountId, 
  PrivateKey, 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType, 
  TokenMintTransaction, 
  TokenId,
  TokenInfoQuery,
  TokenUpdateTransaction,
  TokenDeleteTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  Hbar,
  TokenAssociateTransaction,
  TokenFreezeTransaction,
  TokenUnfreezeTransaction,
  TokenWipeTransaction,
  TokenGrantKycTransaction,
  TokenRevokeKycTransaction,
  TokenPauseTransaction,
  TokenUnpauseTransaction,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery
} from "@hashgraph/sdk";
import { Buffer } from 'buffer';

// Asset Tokenization Studio (ATS) Integration
export interface PropertyTokenizationConfig {
  name: string;
  symbol: string;
  description: string;
  propertyId: string;
  totalShares: number;
  pricePerShare: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    yearBuilt: number;
    propertyType: string;
  };
  images: string[];
  documents: {
    title: string;
    url: string;
    hash: string;
  }[];
  valuation: {
    amount: number;
    date: string;
    valuator: string;
    method: string;
  };
}

// NFT Studio Integration
export interface PropertyNFTConfig {
  name: string;
  symbol: string;
  description: string;
  propertyId: string;
  metadata: Record<string, any>;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Hedera Service with enhanced capabilities
export class HederaService {
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;
  private networkType: 'mainnet' | 'testnet' | 'previewnet';
  private walletConnectEnabled: boolean = false;
  private walletConnectProjectId?: string;

  constructor(
    operatorId: string, 
    operatorKey: string, 
    networkType: 'mainnet' | 'testnet' | 'previewnet' = 'testnet',
    walletConnectProjectId?: string
  ) {
    this.networkType = networkType;
    
    // Initialize Hedera client based on network type
    switch (networkType) {
      case 'mainnet':
        this.client = Client.forMainnet();
        break;
      case 'previewnet':
        this.client = Client.forPreviewnet();
        break;
      case 'testnet':
      default:
        this.client = Client.forTestnet();
        break;
    }
    
    this.operatorId = AccountId.fromString(operatorId);
    this.operatorKey = PrivateKey.fromString(operatorKey);
    this.client.setOperator(this.operatorId, this.operatorKey);
    
    // Set up WalletConnect if project ID is provided
    if (walletConnectProjectId) {
      this.walletConnectEnabled = true;
      this.walletConnectProjectId = walletConnectProjectId;
    }
  }

  // Asset Tokenization Studio (ATS) Methods
  
  /**
   * Create a tokenized real estate asset with full property details
   */
  async createPropertyToken(config: PropertyTokenizationConfig) {
    try {
      // Create a JSON metadata for the token
      const metadata = JSON.stringify({
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        propertyId: config.propertyId,
        location: config.location,
        features: config.features,
        images: config.images,
        documents: config.documents,
        valuation: config.valuation,
        totalShares: config.totalShares,
        pricePerShare: config.pricePerShare,
        createdAt: new Date().toISOString(),
        standard: "MapChain-ATS-1.0"
      });

      // Create fungible token for property shares
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName(config.name)
        .setTokenSymbol(config.symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(config.totalShares)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .setFreezeKey(this.operatorKey)
        .setWipeKey(this.operatorKey)
        .setKycKey(this.operatorKey)
        .setPauseKey(this.operatorKey)
        .setFeeScheduleKey(this.operatorKey)
        .setTokenMemo(metadata.substring(0, 100)) // Memo has a limit
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTx.sign(this.operatorKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateRx.tokenId?.toString();

      // Store full metadata on-chain using a topic (Hedera Consensus Service)
      const topicCreateTx = await new TopicCreateTransaction()
        .setAdminKey(this.operatorKey)
        .setSubmitKey(this.operatorKey)
        .setTopicMemo(`Property Metadata for Token ${tokenId}`)
        .freezeWith(this.client);

      const topicCreateSign = await topicCreateTx.sign(this.operatorKey);
      const topicCreateSubmit = await topicCreateSign.execute(this.client);
      const topicCreateRx = await topicCreateSubmit.getReceipt(this.client);
      const topicId = topicCreateRx.topicId?.toString();

      // Submit the full metadata to the topic
      const submitMessageTx = await new TopicMessageSubmitTransaction()
        .setTopicId(topicCreateRx.topicId!)
        .setMessage(metadata)
        .freezeWith(this.client);

      const submitMessageSign = await submitMessageTx.sign(this.operatorKey);
      const submitMessageSubmit = await submitMessageSign.execute(this.client);
      await submitMessageSubmit.getReceipt(this.client);

      return {
        tokenId,
        topicId,
        metadata
      };
    } catch (error) {
      console.error("Error creating property token:", error);
      throw error;
    }
  }

  /**
   * Transfer property token shares to another account
   */
  async transferPropertyShares(tokenId: string, receiverId: string, amount: number) {
    try {
      const transferTx = await new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), this.operatorId, -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(receiverId), amount)
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(this.operatorKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);

      return {
        transactionId: transferRx.transactionId.toString(),
        status: transferRx.status.toString()
      };
    } catch (error) {
      console.error("Error transferring property shares:", error);
      throw error;
    }
  }

  /**
   * Get property token information
   */
  async getPropertyTokenInfo(tokenId: string) {
    try {
      const query = new TokenInfoQuery()
        .setTokenId(TokenId.fromString(tokenId));

      const tokenInfo = await query.execute(this.client);
      
      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply.toString(),
        decimals: tokenInfo.decimals,
        treasuryAccountId: tokenInfo.treasuryAccountId.toString(),
        adminKey: tokenInfo.adminKey ? "Present" : "Not present",
        supplyKey: tokenInfo.supplyKey ? "Present" : "Not present",
        memo: tokenInfo.tokenMemo
      };
    } catch (error) {
      console.error("Error getting property token info:", error);
      throw error;
    }
  }

  // NFT Studio Methods
  
  /**
   * Create a property NFT with detailed metadata
   */
  async createPropertyNFT(config: PropertyNFTConfig) {
    try {
      // Create NFT with custom fee schedule
      const nftCreate = await new TokenCreateTransaction()
        .setTokenName(config.name)
        .setTokenSymbol(config.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(50000)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .setTokenMemo(config.description.substring(0, 100))
        .freezeWith(this.client);

      const nftCreateTxSign = await nftCreate.sign(this.operatorKey);
      const nftCreateSubmit = await nftCreateTxSign.execute(this.client);
      const nftCreateRx = await nftCreateSubmit.getReceipt(this.client);
      const tokenId = nftCreateRx.tokenId?.toString();

      // Create full metadata in standard NFT format
      const nftMetadata = {
        name: config.name,
        description: config.description,
        image: config.image,
        properties: {
          ...config.metadata,
          propertyId: config.propertyId
        },
        attributes: config.attributes
      };

      // Mint the NFT with metadata
      const mintTx = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId!))
        .setMetadata([Buffer.from(JSON.stringify(nftMetadata))])
        .freezeWith(this.client);

      const mintTxSign = await mintTx.sign(this.operatorKey);
      const mintTxSubmit = await mintTxSign.execute(this.client);
      const mintRx = await mintTxSubmit.getReceipt(this.client);

      return {
        tokenId,
        serialNumber: mintRx.serials && mintRx.serials.length > 0 ? mintRx.serials[0].toString() : null,
        metadata: nftMetadata
      };
    } catch (error) {
      console.error("Error creating property NFT:", error);
      throw error;
    }
  }

  /**
   * Transfer an NFT to another account
   */
  async transferNFT(tokenId: string, serialNumber: number, receiverId: string) {
    try {
      const transferTx = await new TransferTransaction()
        .addNftTransfer(
          TokenId.fromString(tokenId), 
          serialNumber, 
          this.operatorId, 
          AccountId.fromString(receiverId)
        )
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(this.operatorKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);

      return {
        transactionId: transferRx.transactionId.toString(),
        status: transferRx.status.toString()
      };
    } catch (error) {
      console.error("Error transferring NFT:", error);
      throw error;
    }
  }

  /**
   * Burn an NFT
   */
  async burnNFT(tokenId: string, serialNumber: number) {
    try {
      const burnTx = await new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setSerials([serialNumber])
        .freezeWith(this.client);

      const burnSign = await burnTx.sign(this.operatorKey);
      const burnSubmit = await burnSign.execute(this.client);
      const burnRx = await burnSubmit.getReceipt(this.client);

      return {
        transactionId: burnRx.transactionId.toString(),
        status: burnRx.status.toString()
      };
    } catch (error) {
      console.error("Error burning NFT:", error);
      throw error;
    }
  }

  // Hedera WalletConnect Methods
  
  /**
   * Enable WalletConnect integration
   */
  enableWalletConnect(projectId: string) {
    this.walletConnectEnabled = true;
    this.walletConnectProjectId = projectId;
    return {
      enabled: true,
      projectId
    };
  }

  /**
   * Check if WalletConnect is enabled
   */
  isWalletConnectEnabled() {
    return {
      enabled: this.walletConnectEnabled,
      projectId: this.walletConnectProjectId
    };
  }

  /**
   * Get WalletConnect connection URI
   */
  getWalletConnectUri() {
    if (!this.walletConnectEnabled || !this.walletConnectProjectId) {
      throw new Error("WalletConnect is not enabled. Call enableWalletConnect first.");
    }

    // This is a placeholder - in a real implementation, you would use the WalletConnect SDK
    // to generate a proper connection URI
    return `https://walletconnect.org/connect?projectId=${this.walletConnectProjectId}&network=${this.networkType}`;
  }

  // Hedera Developer Playground Methods
  
  /**
   * Deploy a test smart contract
   */
  async deployTestContract(bytecode: string) {
    try {
      // First upload the bytecode to Hedera File Service
      const fileCreateTx = await new FileCreateTransaction()
        .setKeys([this.operatorKey])
        .setContents(bytecode)
        .freezeWith(this.client);
      
      const fileCreateSign = await fileCreateTx.sign(this.operatorKey);
      const fileCreateSubmit = await fileCreateSign.execute(this.client);
      const fileCreateRx = await fileCreateSubmit.getReceipt(this.client);
      const fileId = fileCreateRx.fileId;

      // Now create the contract
      const contractCreateTx = await new ContractCreateTransaction()
        .setGas(100000)
        .setBytecodeFileId(fileId!)
        .setConstructorParameters(new ContractFunctionParameters())
        .freezeWith(this.client);
      
      const contractCreateSign = await contractCreateTx.sign(this.operatorKey);
      const contractCreateSubmit = await contractCreateSign.execute(this.client);
      const contractCreateRx = await contractCreateSubmit.getReceipt(this.client);
      const contractId = contractCreateRx.contractId;

      return {
        fileId: fileId?.toString(),
        contractId: contractId?.toString()
      };
    } catch (error) {
      console.error("Error deploying test contract:", error);
      throw error;
    }
  }

  /**
   * Execute a contract function
   */
  async executeContract(contractId: string, functionName: string, params: any[] = []) {
    try {
      // Convert params to ContractFunctionParameters
      let contractParams = new ContractFunctionParameters();
      
      // Add parameters based on their type
      params.forEach((param, index) => {
        if (typeof param === 'string') {
          contractParams = contractParams.addString(param);
        } else if (typeof param === 'number') {
          if (Number.isInteger(param)) {
            contractParams = contractParams.addInt32(param);
          } else {
            contractParams = contractParams.addInt32(Math.floor(param));
          }
        } else if (typeof param === 'boolean') {
          contractParams = contractParams.addBool(param);
        } else if (Array.isArray(param)) {
          // Simplified handling for arrays - in a real implementation, you'd need more type checking
          contractParams = contractParams.addStringArray(param.map(p => p.toString()));
        }
      });

      const contractExecuteTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(functionName, contractParams)
        .freezeWith(this.client);
      
      const contractExecuteSign = await contractExecuteTx.sign(this.operatorKey);
      const contractExecuteSubmit = await contractExecuteSign.execute(this.client);
      const contractExecuteRx = await contractExecuteSubmit.getReceipt(this.client);

      return {
        transactionId: contractExecuteSubmit.transactionId.toString(),
        status: contractExecuteRx.status.toString()
      };
    } catch (error) {
      console.error("Error executing contract:", error);
      throw error;
    }
  }

  /**
   * Query a contract function (read-only)
   */
  async queryContract(contractId: string, functionName: string, params: any[] = []) {
    try {
      // Convert params to ContractFunctionParameters
      let contractParams = new ContractFunctionParameters();
      
      // Add parameters based on their type (simplified)
      params.forEach((param) => {
        if (typeof param === 'string') {
          contractParams = contractParams.addString(param);
        } else if (typeof param === 'number') {
          contractParams = contractParams.addInt32(param);
        } else if (typeof param === 'boolean') {
          contractParams = contractParams.addBool(param);
        }
      });

      const contractCallQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(functionName, contractParams);
      
      const contractCallResult = await contractCallQuery.execute(this.client);
      
      // Parse the result - this is simplified and would need to be adapted based on the expected return type
      const result = contractCallResult.getString(0);
      
      return {
        result
      };
    } catch (error) {
      console.error("Error querying contract:", error);
      throw error;
    }
  }

  // Hedera CLI-like Methods
  
  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string = this.operatorId.toString()) {
    try {
      const balance = await this.client.getAccountBalance(AccountId.fromString(accountId));
      
      return {
        hbars: balance.hbars.toString(),
        tokens: Object.fromEntries(
          Array.from(balance.tokens.entries()).map(([tokenId, amount]) => [
            tokenId.toString(),
            amount.toString()
          ])
        )
      };
    } catch (error) {
      console.error("Error getting account balance:", error);
      throw error;
    }
  }

  /**
   * Transfer HBAR to another account
   */
  async transferHbar(receiverId: string, amount: number) {
    try {
      const transferTx = await new TransferTransaction()
        .addHbarTransfer(this.operatorId, new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(receiverId), new Hbar(amount))
        .freezeWith(this.client);
      
      const transferSign = await transferTx.sign(this.operatorKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);
      
      return {
        transactionId: transferSubmit.transactionId.toString(),
        status: transferRx.status.toString()
      };
    } catch (error) {
      console.error("Error transferring HBAR:", error);
      throw error;
    }
  }

  /**
   * Associate a token with an account
   */
  async associateToken(accountId: string, tokenId: string) {
    try {
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenId)])
        .freezeWith(this.client);
      
      const associateSign = await associateTx.sign(this.operatorKey);
      const associateSubmit = await associateSign.execute(this.client);
      const associateRx = await associateSubmit.getReceipt(this.client);
      
      return {
        transactionId: associateSubmit.transactionId.toString(),
        status: associateRx.status.toString()
      };
    } catch (error) {
      console.error("Error associating token:", error);
      throw error;
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return {
      network: this.networkType,
      operatorAccount: this.operatorId.toString(),
      clientConnected: this.client ? true : false
    };
  }
}
