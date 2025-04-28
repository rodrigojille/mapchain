const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ValuationEscrow", function () {
  let ValuationEscrow, escrow, owner, client, valuator, platform;

  beforeEach(async function () {
    [owner, client, valuator, platform] = await ethers.getSigners();
    const ValuationEscrowFactory = await ethers.getContractFactory("ValuationEscrow");
    escrow = await ValuationEscrowFactory.deploy();
    await escrow.deployed();
  });

  it("Should create an escrow and emit event", async function () {
    await expect(
      escrow.connect(client).createEscrow(1, valuator.address, false, { value: ethers.utils.parseEther("1") })
    ).to.emit(escrow, "EscrowCreated");
    const e = await escrow.escrows(1);
    expect(e.client).to.equal(client.address);
    expect(e.valuator).to.equal(valuator.address);
    expect(e.amount).to.equal(ethers.utils.parseEther("1"));
    expect(e.status).to.equal(0); // Created
  });

  it("Should allow valuator to accept escrow", async function () {
    await escrow.connect(client).createEscrow(2, valuator.address, false, { value: ethers.utils.parseEther("1") });
    await expect(escrow.connect(valuator).acceptEscrow(2)).to.emit(escrow, "EscrowAccepted");
    const e = await escrow.escrows(2);
    expect(e.status).to.equal(1); // Accepted
  });

  it("Should complete valuation and split payment", async function () {
    await escrow.connect(client).createEscrow(3, valuator.address, false, { value: ethers.utils.parseEther("1") });
    await escrow.connect(valuator).acceptEscrow(3);
    await escrow.grantRole(await escrow.PLATFORM_ROLE(), owner.address);
    await expect(escrow.connect(owner).completeValuation(3)).to.emit(escrow, "EscrowCompleted");
    const e = await escrow.escrows(3);
    expect(e.status).to.equal(2); // Completed
    // Check balances
    expect(await escrow.valuatorBalances(valuator.address)).to.be.gt(0);
    expect(await escrow.platformBalance(escrow.address)).to.be.gt(0);
  });

  it("Should allow cancellation and refund", async function () {
    await escrow.connect(client).createEscrow(4, valuator.address, false, { value: ethers.utils.parseEther("1") });
    await expect(escrow.connect(client).cancelEscrow(4, "change of mind")).to.emit(escrow, "EscrowCancelled");
    const e = await escrow.escrows(4);
    expect(e.status).to.equal(3); // Cancelled
  });

  it("Should allow dispute and resolution", async function () {
    await escrow.connect(client).createEscrow(5, valuator.address, false, { value: ethers.utils.parseEther("1") });
    await escrow.connect(valuator).acceptEscrow(5);
    await escrow.connect(client).raiseDispute(5, "disagreement");
    const e = await escrow.escrows(5);
    expect(e.status).to.equal(4); // Disputed
    await escrow.grantRole(await escrow.PLATFORM_ROLE(), owner.address);
    await escrow.connect(owner).resolveDispute(5, ethers.utils.parseEther("0.5"), ethers.utils.parseEther("0.3"));
    const e2 = await escrow.escrows(5);
    expect(e2.status).to.equal(2); // Completed
  });
});
