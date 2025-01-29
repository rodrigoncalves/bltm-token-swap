import { SUPPORTED_CHAIN_ID } from '@/constants';
import { useAccount, useSwitchChain } from 'wagmi';

interface Props {
  children: React.ReactNode;
}

export default function MainContainer({ children }: Props) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = chainId && chainId !== SUPPORTED_CHAIN_ID;

  const handleSwitchNetwork = () => {
    switchChain({ chainId: SUPPORTED_CHAIN_ID });
  };

  if (isConnected && wrongNetwork) {
    return (
      <p>
        Please switch to the correct network.{' '}
        <span className="underline cursor-pointer text-[14px]" onClick={handleSwitchNetwork}>
          Switch network
        </span>
      </p>
    );
  }

  return <div className="flex flex-col gap-8 items-center sm:items-start">{children}</div>;
}
