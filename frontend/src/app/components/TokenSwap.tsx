import { useState } from 'react';
import { parseUnits } from 'viem';
import { useLiquidityPool } from '../hooks/useLiquidityPool';
import { useTokenBalance } from '../hooks/useTokenBalance';

export default function TokenSwap() {
  const { usdcBalance, usdcDecimals, bltmBalance, refetchBalances } = useTokenBalance();
  const { allowance, isApproving, isDepositing, onApproveDeposit, onDeposit } = useLiquidityPool();
  const [amount, setAmount] = useState<string>('');

  const hasAllowance = Number(allowance) >= Number(amount);

  const handleDeposit = async () => {
    try {
      const value = parseUnits(amount, usdcDecimals);
      if (hasAllowance) {
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

  const handleWithdraw = () => {};

  const invalidAmount = isNaN(Number(amount)) || Number(amount) <= 0;
  const max = Math.max(Number(usdcBalance), Number(bltmBalance));
  const isButtonsDisabled = isApproving || invalidAmount;
  const isDepositDisabled = isButtonsDisabled || Number(amount) > Number(usdcBalance);
  const isWithdrawDisabled = isButtonsDisabled || Number(amount) > Number(bltmBalance);

  return (
    <div className="text-lg font-bold">
      <h3>Swap</h3>
      <p className="text-sm">Allowance: {allowance}</p>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 min-w-[48%]"
        style={{ color: 'black' }}
        min={0}
        max={max}
        disabled={isApproving}
      />
      {isApproving && <p className="text-sm">Approving...</p>}
      {isDepositing && <p className="text-sm">Depositing...</p>}
      {Number(amount) > Number(usdcBalance) && <p className="text-sm text-red-500">Insufficient balance</p>}
      <div className="flex justify-between mt-2">
        <button
          onClick={handleDeposit}
          className={
            'px-4 py-2 bg-green-500 text-white rounded' + (isDepositDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isDepositDisabled}
        >
          {hasAllowance ? 'Swap USDC to BLTM' : 'Approve USDC Deposit'}
        </button>
        <button
          onClick={handleWithdraw}
          className={
            'ml-2 px-4 py-2 bg-red-500 text-white rounded' +
            (isWithdrawDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isWithdrawDisabled}
        >
          Swap BLTM to USDC
        </button>
      </div>
    </div>
  );
}
