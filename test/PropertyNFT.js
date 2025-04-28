const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyNFT", function () {
  let PropertyNFT, propertyNFT, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const PropertyNFTFactory = await ethers.getContractFactory("PropertyNFT");
    propertyNFT = await PropertyNFTFactory.deploy();
    await propertyNFT.deployed();
  });

  it("Should mint a property NFT with correct URI", async function () {
    const uri = "ipfs://property-metadata";
    const tx = await propertyNFT.mintProperty(addr1.address, uri);
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "PropertyMinted");
    const tokenId = event.args.tokenId;
    expect(await propertyNFT.ownerOf(tokenId)).to.equal(addr1.address);
    expect(await propertyNFT.tokenURI(tokenId)).to.equal(uri);
  });

  it("Should add and retrieve valuation history", async function () {
    const uri = "ipfs://property-metadata";
    const tx = await propertyNFT.mintProperty(addr1.address, uri);
    const receipt = await tx.wait();
    const tokenId = receipt.events.find(e => e.event === "PropertyMinted").args.tokenId;
    await propertyNFT.addValuation(tokenId, 100000, "USD", owner.address);
    const history = await propertyNFT.getValuationHistory(tokenId);
    expect(history.length).to.equal(1);
    expect(history[0].amount).to.equal(100000);
    expect(history[0].currency).to.equal("USD");
    expect(history[0].validator).to.equal(owner.address);
  });

  it("Should revert for non-existent property", async function () {
    await expect(propertyNFT.getValuationHistory(999)).to.be.revertedWith("Property does not exist");
  });
});
