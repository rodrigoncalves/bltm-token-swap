'use client';
import { useAccount } from 'wagmi';
import WalletConnect from './components/WalletConnect';
import TokenBalanceAndRate from './components/TokenBalanceAndRate';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-xl font-bold mb-4">BLTM Token Swap</h1>
        <WalletConnect />
        {isConnected && <TokenBalanceAndRate />}
      </main>
    </div>
  );
}
