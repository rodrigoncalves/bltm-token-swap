import { BLTMTokenAbi } from '@/abis/BLTMTokenAbi';
import { LiquidityPoolAbi } from '@/abis/LiquidityPoolAbi';
import { BLTM_ADDRESS, DECIMAL_PLACES, LIQUIDITY_POOL_ADDRESS } from '@/constants';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

export const useRedeem = () => {
  const { address } = useAccount();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: BLTMTokenAbi,
    address: BLTM_ADDRESS,
    functionName: "allowance",
    args: [address, LIQUIDITY_POOL_ADDRESS]
  });

  const { writeContractAsync: redeem, isPending: isRedeeming } = useWriteContract();
  const { writeContractAsync: approve, isPending: isApproving } = useWriteContract();

  const onRedeem = (value: bigint) =>
    redeem({
      abi: LiquidityPoolAbi,
      address: LIQUIDITY_POOL_ADDRESS,
      functionName: 'redeem',
      args: [value]
    }, { onSuccess: () => refetchAllowance() });

  const onApproveRedeem = async (value: bigint) =>
    approve({
      abi: BLTMTokenAbi,
      address: BLTM_ADDRESS,
      functionName: 'approve',
      args: [LIQUIDITY_POOL_ADDRESS, value]
    }, { onSuccess: () => refetchAllowance() });

  return {
    allowance: allowance ? formatUnits(allowance as bigint, DECIMAL_PLACES) : 0n,
    isApproving,
    isRedeeming,
    onApproveRedeem,
    onRedeem,
  };
};
