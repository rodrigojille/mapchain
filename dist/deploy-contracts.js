const { ethers } = require("hardhat");
async function main() {
    // Deploy PropertyNFT
    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const propertyNFT = await PropertyNFT.deploy();
    await propertyNFT.deployed();
    console.log("PropertyNFT deployed to:", propertyNFT.address);
    // Deploy ValuationToken
    const [deployer] = await ethers.getSigners();
    const ValuationToken = await ethers.getContractFactory("ValuationToken");
    const valuationToken = await ValuationToken.deploy(deployer.address);
    await valuationToken.deployed();
    console.log("ValuationToken deployed to:", valuationToken.address);
    // Deploy ValuationEscrow
    const ValuationEscrow = await ethers.getContractFactory("ValuationEscrow");
    const valuationEscrow = await ValuationEscrow.deploy();
    await valuationEscrow.deployed();
    console.log("ValuationEscrow deployed to:", valuationEscrow.address);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
