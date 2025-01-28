import { BLTMTokenAbi } from '@/abis/BLTMTokenAbi';
import { LiquidityPoolAbi } from '@/abis/LiquidityPoolAbi';
import { USDCTokenAbi } from '@/abis/USDCTokenAbi';
import { BLTM_ADDRESS, LIQUIDITY_POOL_ADDRESS, USDC_ADDRESS } from '@/constants';
import { formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

export const useBalanceAndRate = () => {
  const { address } = useAccount();

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: LiquidityPoolAbi,
        address: LIQUIDITY_POOL_ADDRESS,
        functionName: 'exchangeRate'
      },
      {
        abi: BLTMTokenAbi,
        address: BLTM_ADDRESS,
        functionName: 'balanceOf',
        args: [address]
      },
      {
        abi: BLTMTokenAbi,
        address: BLTM_ADDRESS,
        functionName: 'decimals',
      },
      { abi: USDCTokenAbi, address: USDC_ADDRESS, functionName: 'balanceOf', args: [address] },
      { abi: USDCTokenAbi, address: USDC_ADDRESS, functionName: 'decimals' }
    ]
  });

  if (isLoading || !data) {
    return { exchangeRate: 0, usdcBalance: 0, bltmBalance: 0 };
  }

  const [exchangeRate, bltmBalance, bltmDecimals, usdcBalance, usdcDecimals] = data as [bigint, bigint, number, bigint, number];
  return {
    exchangeRate,
    bltmBalance: formatUnits(bltmBalance, bltmDecimals),
    usdcBalance: formatUnits(usdcBalance, usdcDecimals)
  };
}
