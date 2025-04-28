const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
  // 1. Create NFT
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

  // 2. Mint NFT (metadata is a byte array, e.g. Buffer.from("ipfs://..."))
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([Buffer.from("ipfs://property-metadata-uri")])
    .freezeWith(client)
    .sign(operatorKey);

  const mintSubmit = await mintTx.execute(client);
  const mintRx = await mintSubmit.getReceipt(client);

  console.log("Minted NFT serial:", mintRx.serials[0].toString());
}

main().catch(console.error);
