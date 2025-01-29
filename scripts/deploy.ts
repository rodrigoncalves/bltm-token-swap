import hre from "hardhat";

async function main() {
  // Deploy BLTMToken
  const bltmToken = await hre.viem.deployContract("BLTMToken");
  console.log("BLTMToken deployed to:", bltmToken.address);

  // Deploy MockERC20 (USDC)
  const usdc = await hre.viem.deployContract("MockERC20", ["USD Coin", "USDC", 6]);
  console.log("MockERC20 (USDC) deployed to:", usdc.address);

  // Deploy LiquidityPool
  const liquidityPool = await hre.viem.deployContract("LiquidityPool" as never, [usdc.address, bltmToken.address, 1]);
  console.log("LiquidityPool deployed to:", liquidityPool.address);

  // Grant MINTER_ROLE to LiquidityPool for BLTMToken
  const MINTER_ROLE = await bltmToken.read.MINTER_ROLE();
  await bltmToken.write.grantRole([MINTER_ROLE, liquidityPool.address]);
  console.log("Granted MINTER_ROLE to LiquidityPool");

  // const usdc = await hre.viem.getContractAt("MockERC20", "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0");

  // mint some USDC to owner
  const [owner] = await hre.viem.getWalletClients();
  const mintAmount = 10000000n;
  await usdc.write.mint([owner.account.address, mintAmount]);
  console.log("Minted USDC to owner");
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
