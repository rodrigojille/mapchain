const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction } = require("@hashgraph/sdk");
const axios = require("axios");
require("dotenv").config();

// All credentials and secrets are loaded from .env
const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function pinJSONToIPFS(metadata) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const res = await axios.post(url, metadata, {
    headers: {
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataApiSecret,
    }
  });
  return `ipfs://${res.data.IpfsHash}`;
}

async function main() {
  // 1. Pin metadata to IPFS
  const metadata = {
    name: "MapChain Property NFT",
    description: "A property NFT for MapChain",
    image: "ipfs://<your-image-hash>", // Replace with actual image IPFS hash if available
    attributes: [{ trait_type: "Location", value: "Mexico City" }]
  };
  const ipfsUri = await pinJSONToIPFS(metadata);
  console.log("Pinned metadata URI:", ipfsUri);

  // 2. Create HTS NFT
  const createTx = await new TokenCreateTransaction()
    .setTokenName("MapChain Property NFT")
    .setTokenSymbol("MCPNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .freezeWith(client)
    .sign(operatorKey);

  const createSubmit = await createTx.execute(client);
  const createRx = await createSubmit.getReceipt(client);
  const tokenId = createRx.tokenId;
  console.log("Created NFT with Token ID:", tokenId.toString());

  // 3. Mint NFT with IPFS metadata
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([Buffer.from(ipfsUri)])
    .freezeWith(client)
    .sign(operatorKey);

  const mintSubmit = await mintTx.execute(client);
  const mintRx = await mintSubmit.getReceipt(client);

  console.log("Minted NFT serial:", mintRx.serials[0].toString());
}

main().catch(console.error);
