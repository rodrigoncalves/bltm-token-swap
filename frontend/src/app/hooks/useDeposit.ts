import { LiquidityPoolAbi } from '@/abis/LiquidityPoolAbi';
import { USDCTokenAbi } from '@/abis/USDCTokenAbi';
import { LIQUIDITY_POOL_ADDRESS, USDC_ADDRESS } from '@/constants';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

export const useDeposit = () => {
    const { address } = useAccount();

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: USDCTokenAbi,
        address: USDC_ADDRESS,
        functionName: "allowance",
        args: [address, LIQUIDITY_POOL_ADDRESS]
    });

    const { writeContractAsync: swapUSDCForBLTM, isPending: isDepositing } = useWriteContract();
    const { writeContractAsync: approve, isPending: isApproving } = useWriteContract();

    const onDeposit = (value: bigint) =>
        swapUSDCForBLTM({
            abi: LiquidityPoolAbi,
            address: LIQUIDITY_POOL_ADDRESS,
            functionName: 'swapUSDCForBLTM',
            args: [value]
        }, { onSuccess: () => refetchAllowance() });

    const onApproveDeposit = async (value: bigint) =>
        approve({
            abi: USDCTokenAbi,
            address: USDC_ADDRESS,
            functionName: 'approve',
            args: [LIQUIDITY_POOL_ADDRESS, value]
        }, { onSuccess: () => refetchAllowance() });

    return {
        allowance: allowance ? formatUnits(allowance as bigint, 6) : 0n,
        isApproving,
        isDepositing,
        onApproveDeposit,
        onDeposit,
    };
};
