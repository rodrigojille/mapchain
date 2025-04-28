const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ValuationToken", function () {
  let ValuationToken, valuationToken, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const ValuationTokenFactory = await ethers.getContractFactory("ValuationToken");
    valuationToken = await ValuationTokenFactory.deploy();
    await valuationToken.deployed();
  });

  it("Should have correct name and symbol", async function () {
    expect(await valuationToken.name()).to.equal("ValuationToken");
    expect(await valuationToken.symbol()).to.equal("VAL");
  });

  it("Should mint tokens to owner", async function () {
    const balance = await valuationToken.balanceOf(owner.address);
    expect(balance).to.be.gt(0);
  });

  it("Should transfer tokens between accounts", async function () {
    await valuationToken.transfer(addr1.address, 100);
    expect(await valuationToken.balanceOf(addr1.address)).to.equal(100);
  });

  it("Should fail if sender doesn’t have enough tokens", async function () {
    const initialBalance = await valuationToken.balanceOf(owner.address);
    await expect(
      valuationToken.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    expect(await valuationToken.balanceOf(owner.address)).to.equal(initialBalance);
  });
});
