const { PrivateKey, Client, AccountInfoQuery } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  // Parse private key
  let privKey;
  try {
    privKey = PrivateKey.fromString(operatorKey);
  } catch (e) {
    console.error("Invalid private key format:", e.message);
    return;
  }
  const pubKey = privKey.publicKey;
  console.log("Loaded Private Key:", privKey.toString());
  console.log("Derived Public Key:", pubKey.toString());

  // Initialize client with operator credentials
  const client = Client.forTestnet().setOperator(operatorId, privKey);

  try {
    const info = await new AccountInfoQuery()
      .setAccountId(operatorId)
      .execute(client);
    console.log("Account ID:", operatorId);
    console.log("Account Public Key:", info.key.toString());
    if (info.key.toString() === pubKey.toString()) {
      console.log("✅ Private key matches the account's public key!");
    } else {
      console.error("❌ Private key does NOT match the account's public key!");
    }
  } catch (e) {
    console.error("Error querying account info:", e.message);
  }
}

main();
