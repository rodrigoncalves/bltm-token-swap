import hre from "hardhat";
import { formatUnits, parseAbi } from "viem";

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

async function main() {
  const userAddress = '0x69da4f31b51847df3ff0D35865d8DA4fa8C64584';
  const abi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ]);

  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS, abi, functionName: 'balanceOf',
    args: [userAddress],
  });
  const decimals = await publicClient.readContract({
    address: USDC_ADDRESS, abi, functionName: 'decimals',
  });

  const balanceInUSDC = formatUnits(balance as bigint, decimals as number);
  console.log(`USDC Balance of ${userAddress}: ${balanceInUSDC}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
