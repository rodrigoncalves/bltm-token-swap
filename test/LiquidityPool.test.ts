import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { getAddress } from "viem";

const deployLiquidityPool = async () => {
  const usdc = await hre.viem.deployContract("MockERC20", ["USD Coin", "USDC", 6]); // Mock USDC
  const bltm = await hre.viem.deployContract("BLTMToken"); // BLTM Token
  const exchangeRate = 2n; // 1 USDC = 2 BLTM

  const liquidityPool = await hre.viem.deployContract("LiquidityPool", [
    usdc.address,
    bltm.address,
    exchangeRate,
  ]);

  // Grant minter role to LiquidityPool contract for BLTM token
  const [owner] = await hre.viem.getWalletClients();
  const minterRole = await bltm.read.MINTER_ROLE();
  await bltm.write.grantRole([minterRole, liquidityPool.address], { account: owner.account });

  return { usdc, bltm, liquidityPool };
};

describe("LiquidityPool Contract Tests", () => {
  it("should initialize correctly", async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);

    expect(await liquidityPool.read.usdcToken()).to.equal(getAddress(usdc.address));
    expect(await liquidityPool.read.bltmToken()).to.equal(getAddress(bltm.address));
    expect(await liquidityPool.read.exchangeRate()).to.equal(2n);
  });

  it("should allow swapping USDC for BLTM", async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // Mint USDC to user
    await usdc.write.mint([user.account.address, 1000n * 10n ** 6n], { account: owner.account });

    // Check for allowance
    const allowance = await usdc.read.allowance([user.account.address, liquidityPool.address]);
    expect(allowance).to.equal(0n);

    // Approve USDC for LiquidityPool
    await usdc.write.approve([liquidityPool.address, 1000n * 10n ** 6n], { account: user.account });

    // Swap USDC for BLTM
    await liquidityPool.write.swapUSDCForBLTM([1000n * 10n ** 6n], { account: user.account });

    // Check BLTM balance of user
    const bltmBalance = await bltm.read.balanceOf([user.account.address]);
    expect(bltmBalance).to.equal(1960n * 10n ** 6n); // After 2% royalty
  });

  it("should allow redeeming BLTM for USDC", async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // User has USDC
    await usdc.write.mint([user.account.address, 1000n * 10n ** 6n], { account: owner.account });
    expect(await usdc.read.balanceOf([user.account.address])).to.equal(1000n * 10n ** 6n);

    // User deposit USDC to LiquidityPool
    await usdc.write.approve([liquidityPool.address, 1000n * 10n ** 6n], { account: user.account });
    await liquidityPool.write.swapUSDCForBLTM([1000n * 10n ** 6n], { account: user.account });
    expect(await usdc.read.balanceOf([user.account.address])).to.equal(0n);
    expect(await bltm.read.balanceOf([user.account.address])).to.equal(1960n * 10n ** 6n); // After 2% royalty
    expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(1000n * 10n ** 6n);

    // User redeem BLTM for USDC and LP get 2% royalty
    await bltm.write.approve([liquidityPool.address, 1960n * 10n ** 6n], { account: user.account });
    await liquidityPool.write.redeemBLTMForUSDC([1960n * 10n ** 6n], { account: user.account });
    expect(await usdc.read.balanceOf([user.account.address])).to.equal(980n * 10n ** 6n);
    expect(await bltm.read.balanceOf([user.account.address])).to.equal(0n);
    expect(await usdc.read.balanceOf([liquidityPool.address])).to.equal(20n * 10n ** 6n);
  });

  it('should withdraw USDC from LiquidityPool', async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner] = await hre.viem.getWalletClients();

    // Mint USDC to LiquidityPool
    await usdc.write.mint([liquidityPool.address, 1000n * 10n ** 6n], { account: owner.account });

    // Withdraw USDC from LiquidityPool
    await liquidityPool.write.withdrawUSDC([1000n * 10n ** 6n], { account: owner.account });

    // Check USDC balance of LiquidityPool
    const usdcBalance = await usdc.read.balanceOf([liquidityPool.address]);
    expect(usdcBalance).to.equal(0n);
  });

  it('should revert swapping USDC for BLTM if not enough USDC', async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // Mint USDC to user
    await usdc.write.mint([user.account.address, 100n * 10n ** 6n], { account: owner.account });

    // Approve USDC for LiquidityPool
    await usdc.write.approve([liquidityPool.address, 100n * 10n ** 6n], { account: user.account });

    // Swap USDC for BLTM
    await expect(
      liquidityPool.write.swapUSDCForBLTM([1000n * 10n ** 6n], { account: user.account })
    ).to.be.rejectedWith('USDC');
  })

  it('should revert redeeming BLTM for USDC if not enough BLTM', async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // Mint USDC to LiquidityPool
    await usdc.write.mint([liquidityPool.address, 1000n * 10n ** 6n], { account: owner.account });

    // Approve BLTM for LiquidityPool
    await bltm.write.mint([user.account.address, 100n * 10n ** 6n], { account: owner.account });
    await bltm.write.approve([liquidityPool.address, 100n * 10n ** 6n], { account: user.account });

    // Redeem BLTM for USDC
    await expect(
      liquidityPool.write.redeemBLTMForUSDC([1000n * 10n ** 6n], { account: user.account })
    ).to.be.rejectedWith('BLTM');
  });

  it('should revert withdrawing USDC from LiquidityPool if not enough USDC', async () => {
    const { usdc, bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner] = await hre.viem.getWalletClients();

    // Mint USDC to LiquidityPool
    await usdc.write.mint([liquidityPool.address, 100n * 10n ** 6n], { account: owner.account });

    // Withdraw USDC from LiquidityPool
    await expect(
      liquidityPool.write.withdrawUSDC([1000n * 10n ** 6n], { account: owner.account })
    ).to.be.rejectedWith('USDC');
  });

  it('owner should be able to change exchange rate', async () => {
    const { usdc, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner] = await hre.viem.getWalletClients();

    // Change exchange rate
    await liquidityPool.write.setExchangeRate([3n], { account: owner.account });

    // Check exchange rate
    expect(await liquidityPool.read.exchangeRate()).to.equal(3n);
  });


  it('should revert changing exchange rate if not owner', async () => {
    const { liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // Change exchange rate
    await expect(
      liquidityPool.write.setExchangeRate([3n], { account: user.account })
    ).to.be.rejected;
  });

  it('should be able to check if it has MINTER_ROLE and OWNER_ROLE', async () => {
    const { bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner] = await hre.viem.getWalletClients();

    // Check if owner has MINTER_ROLE
    const minterRole = await bltm.read.MINTER_ROLE();
    const hasRole = await bltm.read.hasRole([minterRole, owner.account.address]);
    expect(hasRole).to.be.true;

    // Check if owner has OWNER_ROLE
    const ownerRole = await liquidityPool.read.OWNER_ROLE();
    const hasOwnerRole = await liquidityPool.read.hasRole([ownerRole, owner.account.address]);
    expect(hasOwnerRole).to.be.true;
  });

  it("should be able to check it doesn't have MINTER_ROLE and OWNER_ROLE", async () => {
    const { bltm, liquidityPool } = await loadFixture(deployLiquidityPool);
    const [owner, user] = await hre.viem.getWalletClients();

    // Check if user has MINTER_ROLE
    const minterRole = await bltm.read.MINTER_ROLE();
    const hasRole = await bltm.read.hasRole([minterRole, user.account.address]);
    expect(hasRole).to.be.false;

    // Check if user has OWNER_ROLE
    const ownerRole = await liquidityPool.read.OWNER_ROLE();
    const hasOwnerRole = await liquidityPool.read.hasRole([ownerRole, user.account.address]);
    expect(hasOwnerRole).to.be.false;
  });

});
