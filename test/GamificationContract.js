const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GamificationContract", function () {
  let GamificationContract, contract, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GamificationContract");
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it("Should award points to user", async function () {
    await contract.awardPoints(user.address, "add_property", 100);
    const profile = await contract.getUserProfile(user.address);
    expect(profile.totalPoints).to.equal(100);
  });

  it("Should unlock achievements", async function () {
    await contract.unlockAchievement(user.address, "first_property");
    expect(await contract.hasAchievement(user.address, "first_property")).to.be.true;
  });

  it("Should add property and trigger achievement", async function () {
    await contract.addProperty(user.address);
    const profile = await contract.getUserProfile(user.address);
    expect(profile.propertyCount).to.equal(1);
    expect(await contract.hasAchievement(user.address, "first_property")).to.be.true;
  });

  it("Should record valuation and trigger achievements", async function () {
    await contract.recordValuation(user.address, 95);
    const profile = await contract.getUserProfile(user.address);
    expect(profile.valuationsGiven).to.equal(1);
    expect(await contract.hasAchievement(user.address, "first_valuation")).to.be.true;
  });
});
