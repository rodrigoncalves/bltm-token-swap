import { useState } from 'react';
import { parseUnits } from 'viem';
import { useDeposit } from '../hooks/useLiquidityPool';
import { useRedeem } from '../hooks/useRedeem';
import { useTokenBalance } from '../hooks/useTokenBalance';

export default function TokenSwap() {
  const { usdcBalance, usdcDecimals, bltmBalance, bltmDecimals, refetchBalances } = useTokenBalance();
  const {
    allowance: depositAllowance,
    isApproving: isApprovingDeposit,
    isDepositing,
    onApproveDeposit,
    onDeposit
  } = useDeposit();
  const {
    allowance: redeemAllowance,
    isApproving: isApprovingRedeem,
    isRedeeming,
    onApproveRedeem,
    onRedeem
  } = useRedeem();
  const [amount, setAmount] = useState<string>('');

  const hasDepositAllowance = Number(depositAllowance) >= Number(amount);
  const hasRedeemAllowance = Number(redeemAllowance) >= Number(amount);

  const handleDeposit = async () => {
    try {
      const value = parseUnits(amount, usdcDecimals);
      if (hasDepositAllowance) {
        await onDeposit(value);
        setAmount('');
        refetchBalances?.();
      } else {
        await onApproveDeposit(value);
      }
    } catch (err) {
      const errorParsed = (err as Error).toString();
      if (!errorParsed.includes('User rejected the request')) {
        console.error(err);
      }
    }
  };

  const handleRedeem = async () => {
    try {
      if (hasRedeemAllowance) {
        await onRedeem(parseUnits(amount, bltmDecimals));
        setAmount('');
        refetchBalances?.();
      } else {
        await onApproveRedeem(parseUnits(amount, bltmDecimals));
      }
    } catch (err) {
      const errorParsed = (err as Error).toString();
      if (!errorParsed.includes('User rejected the request')) {
        console.error(err);
      }
    }
  };

  const invalidAmount = isNaN(Number(amount)) || Number(amount) <= 0;
  const max = Math.max(Number(usdcBalance), Number(bltmBalance));
  const isButtonsDisabled = isApprovingDeposit || isApprovingRedeem || invalidAmount;
  const isDepositDisabled = isButtonsDisabled || Number(amount) > Number(usdcBalance);
  const isRendeemDisabled = isButtonsDisabled || Number(amount) > Number(bltmBalance);

  return (
    <div className="text-lg font-bold">
      <h3>Swap</h3>
      <p className="text-sm">USDC Allowance: {depositAllowance}</p>
      <p className="text-sm">BLTM Allowance: {redeemAllowance}</p>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 min-w-[48%]"
        style={{ color: 'black' }}
        min={0}
        max={max}
        disabled={isApprovingDeposit || isApprovingRedeem}
      />
      {(isApprovingDeposit || isApprovingRedeem) && <p className="text-sm">Approving...</p>}
      {isDepositing && <p className="text-sm">Depositing...</p>}
      {isRedeeming && <p className="text-sm">Rendeeming...</p>}
      {Number(amount) > Number(usdcBalance) && <p className="text-sm text-red-500">Insufficient balance</p>}
      <div className="flex justify-between mt-2">
        <button
          onClick={handleDeposit}
          className={
            'px-4 py-2 bg-green-500 text-white rounded' + (isDepositDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isDepositDisabled}
        >
          {hasDepositAllowance ? 'Swap USDC to BLTM' : 'Approve USDC Deposit'}
        </button>
        <button
          onClick={handleRedeem}
          className={
            'ml-2 px-4 py-2 bg-red-500 text-white rounded' + (isRendeemDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isRendeemDisabled}
        >
          {hasRedeemAllowance ? 'Swap BLTM to USDC' : 'Approve BLTM Redeem'}
        </button>
      </div>
    </div>
  );
}
