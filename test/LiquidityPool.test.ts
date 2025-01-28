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

    // Mint USDC and BLTM
    await usdc.write.mint([liquidityPool.address, 1000n * 10n ** 6n], { account: owner.account });
    await bltm.write.mint([user.account.address, 1000n * 10n ** 6n], { account: owner.account });

    // Approve BLTM for LiquidityPool
    await bltm.write.approve([liquidityPool.address, 1000n * 10n ** 6n], { account: user.account });

    // Redeem BLTM for USDC
    await liquidityPool.write.redeemBLTMForUSDC([1000n * 10n ** 6n], { account: user.account });

    // Check USDC balance of user
    const usdcBalance = await usdc.read.balanceOf([user.account.address]);
    expect(usdcBalance).to.equal(500n * 10n ** 6n);
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
});
