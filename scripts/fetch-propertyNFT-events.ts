require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const propertyNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = PropertyNFT.attach(propertyNFTAddress);

  // Get all PropertyMinted events
  const filter = propertyNFT.filters.PropertyMinted();
  const events = await propertyNFT.queryFilter(filter, 0, "latest");

  if (events.length === 0) {
    console.log("No PropertyMinted events found.");
    return;
  }

  for (const event of events) {
    const { tokenId, owner, uri } = event.args;
    console.log(`Token ID: ${tokenId.toString()}, Owner: ${owner}, URI: ${uri}`);
  }
}

main().catch(console.error);
