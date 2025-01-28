'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnect() {
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    if (connectors.length) {
      connect({ connector: connectors[connectors.length - 1] });
    }
  };

  return (
    <>
      {!isConnected ? (
        <button
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          onClick={handleConnect}
        >
          Connect with Metamask
        </button>
      ) : (
        <>
          <p className="text-sm sm:text-base text-center sm:text-left">
            Connected as <span className="font-bold">{address}</span>
          </p>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </>
      )}
    </>
  );
}
