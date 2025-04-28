const formidable = require("formidable");
const fs = require("fs");
const axios = require("axios");
const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

// Helper: Pin image file to Pinata
async function pinFileToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));
  const res = await axios.post(url, data, {
    maxBodyLength: Infinity,
    headers: {
      ...data.getHeaders(),
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_API_SECRET
    }
  });
  return `ipfs://${res.data.IpfsHash}`;
}

// Helper: Pin metadata JSON to Pinata
async function pinJSONToIPFS(metadata) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const res = await axios.post(url, metadata, {
    headers: {
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_API_SECRET,
    }
  });
  return `ipfs://${res.data.IpfsHash}`;
}

// Helper: Mint NFT on Hedera
async function mintHederaNFT(metadataUris) {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  // Create NFT collection
  const createTx = await new TokenCreateTransaction()
    .setTokenName("MapChain Property NFT")
    .setTokenSymbol("MCPNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(metadataUris.length)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .freezeWith(client)
    .sign(operatorKey);
  const createSubmit = await createTx.execute(client);
  const createRx = await createSubmit.getReceipt(client);
  const tokenId = createRx.tokenId;

  // Mint NFTs
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata(metadataUris.map(uri => Buffer.from(uri)))
    .freezeWith(client)
    .sign(operatorKey);
  const mintSubmit = await mintTx.execute(client);
  const mintRx = await mintSubmit.getReceipt(client);

  return {
    tokenId: tokenId.toString(),
    serials: mintRx.serials.map(s => s.toString()),
    metadataUris
  };
}

// Main API handler
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Parse form data (support batch)
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: "Form parse error", details: err.message });
      return;
    }

    let properties = [];
    try {
      properties = JSON.parse(fields.properties);
    } catch (e) {
      res.status(400).json({ error: "Invalid properties JSON", details: e.message });
      return;
    }

    // Support single or batch image upload
    const images = Array.isArray(files.images) ? files.images : [files.images];

    try {
      // Pin images and metadata
      const metadataUris = [];
      for (let i = 0; i < properties.length; i++) {
        const imgIpfs = await pinFileToIPFS(images[i].filepath);
        const metadata = {
          ...properties[i],
          image: imgIpfs
        };
        const metaIpfs = await pinJSONToIPFS(metadata);
        metadataUris.push(metaIpfs);
      }
      // Mint NFTs
      const result = await mintHederaNFT(metadataUris);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ error: "Minting failed", details: e.message });
    }
  });
};
