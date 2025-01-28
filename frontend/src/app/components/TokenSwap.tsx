import { useState } from 'react';
import { useBalanceAndRate } from '../hooks/useBalanceAndRate';

export default function TokenSwap() {
  const { usdcBalance, bltmBalance } = useBalanceAndRate();
  const [amount, setAmount] = useState<string>('');

  const handleDeposit = () => {};

  const handleWithdraw = () => {};

  const invalidAmount = isNaN(Number(amount)) || Number(amount) <= 0;
  const max = Math.max(Number(usdcBalance), Number(bltmBalance));
  const isDepositDisabled = invalidAmount || Number(amount) > Number(usdcBalance);
  const isWithdrawDisabled = invalidAmount || Number(amount) > Number(bltmBalance);

  return (
    <div className="text-lg font-bold">
      <h3>Swap</h3>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 min-w-[48%]"
        style={{ color: 'black' }}
        min={0}
        max={max}
      />
      <div className="flex justify-between mt-2">
        <button
          onClick={handleDeposit}
          className={
            'px-4 py-2 bg-green-500 text-white rounded' + (isDepositDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isDepositDisabled}
        >
          Deposit USDC & Receive BLTM
        </button>
        <button
          onClick={handleWithdraw}
          className={
            'ml-2 px-4 py-2 bg-red-500 text-white rounded' +
            (isWithdrawDisabled ? ' opacity-50 cursor-not-allowed' : '')
          }
          disabled={isWithdrawDisabled}
        >
          Withdraw BLTM & Receive USDC
        </button>
      </div>
    </div>
  );
}
