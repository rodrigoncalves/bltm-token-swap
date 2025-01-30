import { BLTMTokenAbi } from '@/abis/BLTMTokenAbi';
import { LiquidityPoolAbi } from '@/abis/LiquidityPoolAbi';
import { BLTM_ADDRESS, DECIMAL_PLACES, LIQUIDITY_POOL_ADDRESS } from '@/constants';
import { useEffect } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useTokenBalance } from './useTokenBalance';

export const useRedeem = () => {
  const { address } = useAccount();
  const { refetchBalances } = useTokenBalance();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: BLTMTokenAbi,
    address: BLTM_ADDRESS,
    functionName: "allowance",
    args: [address, LIQUIDITY_POOL_ADDRESS]
  });

  const { writeContractAsync: approve, data: approveTxHash, isPending: isPendingApproval } = useWriteContract();
  const { writeContractAsync: redeem, data: redeemTxHash, isPending: isPendingRedeem } = useWriteContract();
  const { data: approvedReceipt, isSuccess: isApproved, isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { data: depositReceipt, isSuccess: isRedeemed, isLoading: isRedeeming } = useWaitForTransactionReceipt({ hash: redeemTxHash })

  useEffect(() => {
    if (approvedReceipt && isApproved || depositReceipt && isRedeemed) {
      refetchAllowance();
      refetchBalances?.();
    }
  }, [approvedReceipt, depositReceipt, isApproved, isRedeemed, refetchAllowance, refetchBalances])

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
    isApproving: isPendingApproval || isApproving,
    isRedeeming: isPendingRedeem || isRedeeming,
    onApproveRedeem,
    onRedeem,
  };
};
