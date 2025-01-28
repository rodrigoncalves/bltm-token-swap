import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function TokenBalanceAndRate() {
  const { address } = useAccount();

  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [bltmBalance, setBltmBalance] = useState<string>('0');

  const fetchExchangeRate = async () => {};

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Token Balances</h2>
      <div className="flex flex-col gap-2">
        <p>Exchange Rate 1 BLTM = {exchangeRate} USDC</p>
        <p>USDC Balance: {usdcBalance}</p>
        <p>BLTM Balance: {bltmBalance}</p>
      </div>
    </div>
  );
}
