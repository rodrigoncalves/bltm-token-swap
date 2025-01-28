import { useBalanceAndRate } from '../hooks/useBalanceAndRate';

export default function TokenBalanceAndRate() {
  const { exchangeRate, usdcBalance, bltmBalance } = useBalanceAndRate();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Token Balances</h2>
      <div className="flex flex-col gap-2">
        <p>Exchange Rate 1 USDC = {exchangeRate} BLTM</p>
        <p>USDC Balance: {usdcBalance}</p>
        <p>BLTM Balance: {bltmBalance}</p>
      </div>
    </div>
  );
}
