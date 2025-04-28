const { ethers } = require("hardhat");
async function main() {
    const [deployer] = await ethers.getSigners();
    // Deployed contract address
    const propertyNFTAddress = "0x06512E8C64b7F0CA808Ba47A7e4e03ca219Aa947";
    // Attach to deployed contract
    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const propertyNFT = PropertyNFT.attach(propertyNFTAddress);
    // Example: Mint a PropertyNFT to deployer
    const tx = await propertyNFT.mint(deployer.address, "ipfs://property-metadata-uri");
    const receipt = await tx.wait();
    console.log("Minted PropertyNFT! Transaction hash:", receipt.transactionHash);
}
main().catch(console.error);
