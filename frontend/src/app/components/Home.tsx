import WalletConnect from './WalletConnect';
import TokenBalanceAndRate from './TokenBalanceAndRate';
import TokenSwap from './TokenSwap';
import TransactionHistory from './TransactionHistory';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <>
      <WalletConnect />
      {isConnected && (
        <>
          <TokenBalanceAndRate />
          <TokenSwap />
          <TransactionHistory />
        </>
      )}
    </>
  );
}
