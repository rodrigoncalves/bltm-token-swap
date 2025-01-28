'use client';
import WalletConnect from './components/WalletConnect';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-xl font-bold mb-4">BLTM Token Swap</h1>
        <WalletConnect />
      </main>
    </div>
  );
}
