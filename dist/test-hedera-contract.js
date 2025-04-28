"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@hashgraph/sdk");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log('ENV DEBUG:', process.env.HEDERA_OPERATOR_ID, process.env.HEDERA_OPERATOR_KEY);
// Constants for testing
const PROPERTY_NAME = 'Test Property';
const PROPERTY_SYMBOL = 'TPROP';
const VALUATION_NAME = 'Test Valuation';
const VALUATION_SYMBOL = 'TVAL';
const METADATA_HASH = "ipfs://QmTest123456789"; // Example: short IPFS CID or hash
async function main() {
    console.log('🏠 MapChain Hedera Contract Test');
    console.log('-------------------------------');
    // Check for required environment variables
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const valuationContractId = process.env.NEXT_PUBLIC_VALUATION_CONTRACT_ID;
    if (!operatorId || !operatorKey) {
        console.error('❌ Missing required environment variables. Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY');
        return;
    }
    console.log(`👤 Using operator: ${operatorId}`);
    try {
        // Initialize Hedera client
        console.log('🔄 Initializing Hedera client...');
        const client = sdk_1.Client.forTestnet();
        client.setOperator(sdk_1.AccountId.fromString(operatorId), sdk_1.PrivateKey.fromString(operatorKey));
        console.log('✅ Hedera client initialized');
        // Step 1: Create a property NFT token
        console.log('\n📝 Step 1: Creating property NFT token...');
        const propertyTokenId = await createPropertyNFT(client, PROPERTY_NAME, PROPERTY_SYMBOL);
        if (!propertyTokenId) {
            console.error('❌ Failed to create property NFT');
            return;
        }
        console.log(`✅ Property NFT created with token ID: ${propertyTokenId}`);
        // Step 2: Mint a property NFT with metadata
        console.log('\n🔨 Step 2: Minting property NFT with metadata...');
        const mintTxId = await mintPropertyNFT(client, propertyTokenId, METADATA_HASH);
        console.log(`✅ Property NFT minted with transaction ID: ${mintTxId}`);
        // Step 3: Create a valuation token
        console.log('\n📊 Step 3: Creating valuation token...');
        const valuationTokenId = await createValuationToken(client, VALUATION_NAME, VALUATION_SYMBOL);
        if (!valuationTokenId) {
            console.error('❌ Failed to create valuation token');
            return;
        }
        console.log(`✅ Valuation token created with token ID: ${valuationTokenId}`);
        // Step 4: Execute valuation contract (if available)
        if (valuationContractId) {
            console.log('\n⚙️ Step 4: Executing valuation contract...');
            const valuationResult = await executeValuationContract(client, valuationContractId, propertyTokenId, 750000, // Valuation amount in USD
            'ipfs://QmTest123456789', // Metadata URI
            true // Official valuation
            );
            console.log(`✅ Valuation contract executed: ${valuationResult}`);
        }
        else {
            console.log('\n⚠️ Skipping valuation contract execution - contract ID not provided');
        }
        console.log('\n🎉 All tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during test execution:', error);
    }
}
async function createPropertyNFT(client, name, symbol) {
    var _a;
    try {
        const transaction = new sdk_1.TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setTokenType(sdk_1.TokenType.NonFungibleUnique)
            .setSupplyType(sdk_1.TokenSupplyType.Finite)
            .setInitialSupply(0)
            .setMaxSupply(1)
            .setTreasuryAccountId(client.operatorAccountId)
            .setAdminKey(client.operatorPublicKey)
            .setSupplyKey(client.operatorPublicKey)
            .freezeWith(client);
        const signedTx = await transaction.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY));
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        return (_a = receipt.tokenId) === null || _a === void 0 ? void 0 : _a.toString();
    }
    catch (error) {
        console.error('Error creating property NFT:', error);
        throw error;
    }
}
async function mintPropertyNFT(client, tokenId, metadata) {
    try {
        const transaction = new sdk_1.TokenMintTransaction()
            .setTokenId(sdk_1.TokenId.fromString(tokenId))
            .setMetadata([Buffer.from(metadata)])
            .freezeWith(client);
        const signedTx = await transaction.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY));
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        return receipt.status.toString();
    }
    catch (error) {
        console.error('Error minting property NFT:', error);
        throw error;
    }
}
async function createValuationToken(client, name, symbol) {
    var _a;
    try {
        const transaction = new sdk_1.TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setTokenType(sdk_1.TokenType.NonFungibleUnique)
            .setSupplyType(sdk_1.TokenSupplyType.Finite)
            .setInitialSupply(0)
            .setMaxSupply(1000)
            .setTreasuryAccountId(client.operatorAccountId)
            .setAdminKey(client.operatorPublicKey)
            .setSupplyKey(client.operatorPublicKey)
            .freezeWith(client);
        const signedTx = await transaction.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY));
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        return (_a = receipt.tokenId) === null || _a === void 0 ? void 0 : _a.toString();
    }
    catch (error) {
        console.error('Error creating valuation token:', error);
        throw error;
    }
}
async function executeValuationContract(client, contractIdStr, propertyTokenId, value, metadataUri, isOfficial) {
    try {
        const contractId = sdk_1.ContractId.fromString(contractIdStr);
        const functionParams = new sdk_1.ContractFunctionParameters()
            .addString(propertyTokenId)
            .addUint256(value)
            .addString(metadataUri)
            .addBool(isOfficial);
        const transaction = new sdk_1.ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction('createValuation', functionParams)
            .freezeWith(client);
        const signedTx = await transaction.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY));
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        return receipt.status.toString();
    }
    catch (error) {
        console.error('Error executing valuation contract:', error);
        throw error;
    }
}
// Run the test
main().catch(console.error);
