const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Deployed contract address
  const propertyNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Attach to deployed contract
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = PropertyNFT.attach(propertyNFTAddress);

  // Use the Hedera wallet from .env
  const deployer = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, ethers.provider);

  console.log("Deployer address:", deployer.address);

  // Diagnostic: check token IDs 1–20
  for (let i = 1; i <= 20; i++) {
    try {
      const owner = await propertyNFT.ownerOf(i);
      console.log(`Token ID ${i} exists. Owner: ${owner}`);
      const uri = await propertyNFT.tokenURI(i);
      console.log(`  Token URI: ${uri}`);
    } catch (err) {
      // Token does not exist
    }
  }

  // Mint a new PropertyNFT
  const tx = await propertyNFT.mintProperty(deployer.address, "ipfs://property-metadata-uri");
  const receipt = await tx.wait();
  console.log("Minted PropertyNFT! Transaction hash:", receipt.transactionHash);

  // Fetch the current tokenId from the contract's counter
  // This assumes _tokenIds is public or you have a function to expose it
  // If not, we will try tokenId = await propertyNFT.totalSupply() or similar
  let tokenId;
  try {
    // Try to get the latest tokenId by checking ownership incrementally
    for (let i = 1; i < 10; i++) {
      try {
        const owner = await propertyNFT.ownerOf(i);
        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
          tokenId = i;
        }
      } catch (err) { /* token does not exist */ }
    }
  } catch (err) { console.warn("Could not determine tokenId by ownership."); }

  if (tokenId) {
    console.log("Minted Token ID:", tokenId);
    const owner = await propertyNFT.ownerOf(tokenId);
    const uri = await propertyNFT.tokenURI(tokenId);
    console.log("Owner:", owner);
    console.log("Token URI:", uri);
  } else {
    console.warn("Could not determine tokenId. Please check contract state.");
  }
}

main().catch(console.error);
