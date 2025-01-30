import { LiquidityPoolAbi } from '@/abis/LiquidityPoolAbi';
import { USDCTokenAbi } from '@/abis/USDCTokenAbi';
import { DECIMAL_PLACES, LIQUIDITY_POOL_ADDRESS, USDC_ADDRESS } from '@/constants';
import { useEffect } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useTokenBalance } from './useTokenBalance';

export const useDeposit = () => {
  const { address } = useAccount();
  const { refetchBalances } = useTokenBalance();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: USDCTokenAbi,
    address: USDC_ADDRESS,
    functionName: "allowance",
    args: [address, LIQUIDITY_POOL_ADDRESS]
  });

  const { writeContractAsync: approve, data: approveTxHash, isPending: isPendingApproval } = useWriteContract();
  const { writeContractAsync: deposit, data: depositTxHash, isPending: isPendingDeposit } = useWriteContract();
  const { data: approvedReceipt, isSuccess: isApproved, isLoading: isApproving, error: isApprovingFailed } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { data: depositReceipt, isSuccess: isDeposited, isLoading: isDepositing } = useWaitForTransactionReceipt({ hash: depositTxHash })

  const onDeposit = (value: bigint) =>
    deposit({
      abi: LiquidityPoolAbi,
      address: LIQUIDITY_POOL_ADDRESS,
      functionName: 'deposit',
      args: [value]
    });

  const onApproveDeposit = async (value: bigint) =>
    approve({
      abi: USDCTokenAbi,
      address: USDC_ADDRESS,
      functionName: 'approve',
      args: [LIQUIDITY_POOL_ADDRESS, value]
    });

  useEffect(() => {
    if (approvedReceipt && isApproved || depositReceipt && isDeposited) {
      console.log('Transaction was successful:', approvedReceipt, depositReceipt);
      refetchAllowance();
      refetchBalances?.();
    }
  }, [approvedReceipt, depositReceipt, isApproved, isDeposited, refetchAllowance, refetchBalances])

  return {
    allowance: allowance ? formatUnits(allowance as bigint, DECIMAL_PLACES) : 0n,
    isApproving: isPendingApproval || isApproving,
    isDepositing: isPendingDeposit || isDepositing,
    isApprovingFailed: isApprovingFailed || false,
    onApproveDeposit,
    onDeposit,
  };
};
