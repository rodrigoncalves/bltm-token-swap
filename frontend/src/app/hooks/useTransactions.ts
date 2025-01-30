import { LiquidityPoolAbi } from "@/abis/LiquidityPoolAbi";
import { DECIMAL_PLACES, LIQUIDITY_POOL_ADDRESS } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { formatUnits, parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";

interface Transaction {
  txHash: string;
  date: string;
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

  const tokensSwappedEventAbi = parseAbiItem('event TokensSwapped(address indexed user, uint256 usdcAmount, uint256 bltmAmount)');
  const tokensRedeemedEventAbi = parseAbiItem('event TokensRedeemed(address indexed user, uint256 bltmAmount, uint256 usdcAmount)');

  const fetchTransactions = async () => {
    if (!publicClient) return;

    try {
      const [pastDeposits, pastRedeems] = await Promise.all([
        publicClient.getLogs({
          address: LIQUIDITY_POOL_ADDRESS,
          event: tokensSwappedEventAbi,
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: LIQUIDITY_POOL_ADDRESS,
          event: tokensRedeemedEventAbi,
          fromBlock: 0n,
          toBlock: "latest",
        })
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatEvent = async (event: any, action: string) => {
        const args = event.args as TokenSwapEvent['args'];
        const amount = action === "Deposit" ? args.usdcAmount : args.bltmAmount;
        const block = await publicClient.getBlock(event.blockNumber);
        return {
          txHash: event.transactionHash,
          date: new Date(Number(block.timestamp) * 1000).toLocaleString(),
          action,
          amount: formatUnits(amount, DECIMAL_PLACES),
          user: args.user
        }
      }

      const [formattedPastDeposits, formattedPastRedeems] = await Promise.all([
        Promise.all(pastDeposits.map(async (event) => await formatEvent(event, "Deposit"))),
        Promise.all(pastRedeems.map(async (event) => await formatEvent(event, "Withdraw"))),
      ]);

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
      logs.forEach((log) => {
        const event = (log as never as TokenSwapEvent);
        const txHash = event.transactionHash;
        if (!processedLogs.current.has(txHash)) {
          processedLogs.current.add(txHash);
          setTransactions((prev) => [
            ...prev,
            {
              txHash,
              date: new Date().toLocaleString(),
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
      logs.forEach((log) => {
        const event = (log as never as TokenSwapEvent);
        const txHash = event.transactionHash;
        if (!processedLogs.current.has(txHash)) {
          processedLogs.current.add(txHash);
          setTransactions((prev) => [
            ...prev,
            {
              txHash,
              date: new Date().toLocaleString(),
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
