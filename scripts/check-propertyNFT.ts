const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const propertyNFTAddress = "0x06512E8C64b7F0CA808Ba47A7e4e03ca219Aa947";
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = PropertyNFT.attach(propertyNFTAddress);

  // The last minted tokenId is likely 1 (if this was the first mint)
  const tokenId = 1;

  // Get owner
  const owner = await propertyNFT.ownerOf(tokenId);
  console.log("Owner of tokenId", tokenId, ":", owner);

  // Get token URI
  const uri = await propertyNFT.tokenURI(tokenId);
  console.log("Token URI:", uri);
}

main().catch(console.error);
