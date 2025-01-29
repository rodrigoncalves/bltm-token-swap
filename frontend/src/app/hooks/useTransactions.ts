import { LiquidityPoolAbi } from "@/abis/LiquidityPoolAbi";
import { DECIMAL_PLACES, LIQUIDITY_POOL_ADDRESS } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { formatUnits, parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";

interface Transaction {
  txHash: string;
  action: string;
  amount: string;
  user: string;
}

interface TokenSwapEvent {
  transactionHash: string;
  args: {
    user: string;
    owner: string;
    usdcAmount: bigint,
    bltmAmount: bigint
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const publicClient = usePublicClient();
  const [latestBlock, setLatestBlock] = useState<bigint>(0n);
  const processedLogs = useRef(new Set());

  const tokensSwappedAbi = parseAbiItem('event TokensSwapped(address indexed user, uint256 usdcAmount, uint256 bltmAmount)');
  const tokensRedeemedAbi = parseAbiItem('event TokensRedeemed(address indexed user, uint256 bltmAmount, uint256 usdcAmount)');

  const fetchTransactions = async () => {
    if (!publicClient) return;

    try {
      const pastDeposits = await publicClient.getLogs({
        address: LIQUIDITY_POOL_ADDRESS,
        event: tokensSwappedAbi,
        fromBlock: 0n,
        toBlock: "latest",
      });

      const formattedPastDeposits = (pastDeposits as never as TokenSwapEvent[]).map((event) => ({
        txHash: event.transactionHash,
        action: "Deposit",
        amount: formatUnits(event.args.usdcAmount, DECIMAL_PLACES),
        user: event.args.user,
      }))

      const pastRedeems = await publicClient.getLogs({
        address: LIQUIDITY_POOL_ADDRESS,
        event: tokensRedeemedAbi,
        fromBlock: 0n,
        toBlock: "latest",
      });

      const formattedPastRedeems = (pastRedeems as never as TokenSwapEvent[]).map((event) => ({
        txHash: event.transactionHash,
        action: "Redeem",
        amount: formatUnits(event.args.bltmAmount, DECIMAL_PLACES),
        user: event.args.user,
      }));

      const newTransactions = [...formattedPastDeposits, ...formattedPastRedeems];
      setTransactions(newTransactions);

      newTransactions.forEach(t => processedLogs.current.add(t.txHash))
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLatestBlock = async () => {
    if (!publicClient) return;

    try {
      const block = await publicClient.getBlockNumber();
      setLatestBlock(block);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log('----------------')
    fetchTransactions();
    fetchLatestBlock();
  }, [publicClient]);


  // Subscribe to real-time TokensSwapped event
  useWatchContractEvent({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolAbi,
    eventName: 'TokensSwapped',
    fromBlock: latestBlock,
    onLogs(logs) {
      console.log("🚀 ~ onLogs ~ TokensSwapped:", logs)
      logs.forEach((log) => {
        const event = (log as never as TokenSwapEvent);
        const txHash = event.transactionHash;
        if (!processedLogs.current.has(txHash)) {
          processedLogs.current.add(txHash);
          setTransactions((prev) => [
            ...prev,
            {
              txHash,
              action: 'Deposit',
              amount: formatUnits(event.args.usdcAmount, DECIMAL_PLACES),
              user: event.args.owner,
            },
          ]);
        }
      });
    },
  });

  // Subscribe to real-time TokensRedeemed event
  useWatchContractEvent({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolAbi,
    eventName: 'TokensRedeemed',
    fromBlock: latestBlock,
    onLogs(logs) {
      console.log("🚀 ~ onLogs ~ TokensRedeemed:", logs)
      logs.forEach((log) => {
        const event = (log as never as TokenSwapEvent);
        const txHash = event.transactionHash;
        if (!processedLogs.current.has(txHash)) {
          processedLogs.current.add(txHash);
          setTransactions((prev) => [
            ...prev,
            {
              txHash,
              action: 'Withdraw',
              amount: formatUnits(event.args.usdcAmount, DECIMAL_PLACES),
              user: event.args.owner,
            },
          ]);
        }
      });
    },
  });

  return transactions;
}
