const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const propertyNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = PropertyNFT.attach(propertyNFTAddress);

  const deployer = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, ethers.provider);
  const ownerAddress = deployer.address;
  console.log("Fetching NFTs owned by:", ownerAddress);

  // Try token IDs 1-50 and print those owned by the deployer
  for (let tokenId = 1; tokenId <= 50; tokenId++) {
    try {
      const owner = await propertyNFT.ownerOf(tokenId);
      if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
        const uri = await propertyNFT.tokenURI(tokenId);
        console.log(`Token ID: ${tokenId}, URI: ${uri}`);
      }
    } catch (err) {
      // token does not exist
    }
  }
}

main().catch(console.error);
