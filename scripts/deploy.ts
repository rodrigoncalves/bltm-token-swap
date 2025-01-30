import hre from "hardhat";
import { USDC_ADDRESS } from "./usdc";

// Commented code useful for running the script locally
async function main() {
  // Deploy BLTMToken
  const bltmToken = await hre.viem.deployContract("BLTMToken");
  console.log(`✅ BLTMToken deployed at: ${bltmToken.address}`);

  // Deploy MockERC20 (USDC)
  // const usdc = await hre.viem.deployContract("MockERC20", ["USD Coin", "USDC", 6]);
  // console.log("MockERC20 (USDC) deployed to:", usdc.address);

  // Deploy LiquidityPool
  const EXCHANGE_RATE = 1n;
  const liquidityPool = await hre.viem.deployContract("LiquidityPool" as never, [USDC_ADDRESS, bltmToken.address, EXCHANGE_RATE]);
  console.log(`✅ LiquidityPool deployed at: ${liquidityPool.address}`);

  // Grant MINTER_ROLE to LiquidityPool for BLTMToken
  const MINTER_ROLE = await bltmToken.read.MINTER_ROLE();
  await bltmToken.write.grantRole([MINTER_ROLE, liquidityPool.address]);
  console.log("Liquidity Pool granted MINTER_ROLE");

  // Get block number
  const blockNumber = await (await hre.viem.getPublicClient()).getBlockNumber();
  console.log(`Block Number: ${blockNumber}`);

  // mint some USDC to owner
  // const [owner] = await hre.viem.getWalletClients();
  // const mintAmount = 10000000n;
  // await usdc.write.mint([owner.account.address, mintAmount]);
  // console.log("Minted USDC to owner");
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
