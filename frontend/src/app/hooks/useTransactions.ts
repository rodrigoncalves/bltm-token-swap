import { LiquidityPoolAbi } from "@/abis/LiquidityPoolAbi";
import { DECIMAL_PLACES, FROM_BLOCK, LIQUIDITY_POOL_ADDRESS } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { formatUnits, parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useIndexedDBTransactions } from "./useIndexedDBTransactions";
import { Transaction } from "../storage/transactionDB";

interface TokenSwapEvent {
  transactionHash: string;
  args: {
    user: string;
    owner: string;
    usdcAmount: bigint;
    bltmAmount: bigint;
  };
}

export function useTransactions() {
  const { getAllTransactions, addTransaction, getTransactionByHash } = useIndexedDBTransactions();
  const [transactionState, setTransactionState] = useState<Transaction[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint>(0n);
  const publicClient = usePublicClient();
  const processedLogs = useRef(new Set());

  const tokensSwappedEventAbi = parseAbiItem(
    "event TokensSwapped(address indexed user, uint256 usdcAmount, uint256 bltmAmount)"
  );
  const tokensRedeemedEventAbi = parseAbiItem(
    "event TokensRedeemed(address indexed user, uint256 bltmAmount, uint256 usdcAmount)"
  );

  // ✅ Load Cached Transactions First
  useEffect(() => {
    const loadCachedTransactions = async () => {
      const cachedTxs = await getAllTransactions();
      setTransactionState(cachedTxs); // ✅ Show cached data instantly
    };
    loadCachedTransactions();
  }, []);

  // ✅ Always Fetch Transactions from Blockchain (To Update IndexedDB)
  const fetchTransactions = async () => {
    if (!publicClient) return;

    try {
      const latestBlock = await publicClient.getBlockNumber();
      const batchSize = 10_000n; // because Sepolia freetier 
      let fromBlock = FROM_BLOCK;

      let pastDeposits: any[] = [];
      let pastRedeems: any[] = [];
      while (fromBlock < latestBlock) {
        const toBlock = fromBlock + batchSize > latestBlock ? latestBlock : fromBlock + batchSize;
        console.log(`Fetching logs from block ${fromBlock} to ${toBlock}...`);

        const [batchDeposits, batchRedeems] = await Promise.all([
          publicClient.getLogs({
            address: LIQUIDITY_POOL_ADDRESS,
            event: tokensSwappedEventAbi,
            fromBlock: fromBlock,
            toBlock: toBlock,
          }),
          publicClient.getLogs({
            address: LIQUIDITY_POOL_ADDRESS,
            event: tokensRedeemedEventAbi,
            fromBlock: fromBlock,
            toBlock: toBlock,
          }),
        ]);

        pastDeposits = [...pastDeposits, ...batchDeposits];
        pastRedeems = [...pastRedeems, ...batchRedeems];

        fromBlock = toBlock + 1n; // Move to next batch
      }

      // const [pastDeposits, pastRedeems] = await Promise.all([
      //   publicClient.getLogs({
      //     address: LIQUIDITY_POOL_ADDRESS,
      //     event: tokensSwappedEventAbi,
      //     fromBlock: FROM_BLOCK,
      //     toBlock: "latest",
      //   }),
      //   publicClient.getLogs({
      //     address: LIQUIDITY_POOL_ADDRESS,
      //     event: tokensRedeemedEventAbi,
      //     fromBlock: FROM_BLOCK,
      //     toBlock: "latest",
      //   }),
      // ]);

      const formatEvent = async (event: any, action: string): Promise<Transaction> => {
        const args = event.args as TokenSwapEvent["args"];
        const amount = action === "Deposit" ? args.usdcAmount : args.bltmAmount;
        const block = await publicClient.getBlock(event.blockNumber);

        return {
          txHash: event.transactionHash,
          timestamp: block.timestamp,
          date: new Date(Number(block.timestamp) * 1000).toLocaleString(),
          action,
          amount: formatUnits(amount, DECIMAL_PLACES),
          user: args.user,
        };
      };

      const [formattedPastDeposits, formattedPastRedeems] = await Promise.all([
        Promise.all(pastDeposits.map(async (event) => await formatEvent(event, "Deposit"))),
        Promise.all(pastRedeems.map(async (event) => await formatEvent(event, "Withdraw"))),
      ]);

      const newTransactions = [...formattedPastDeposits, ...formattedPastRedeems];

      // ✅ Store only new transactions in IndexedDB
      let addedTransactions = false;
      for (const tx of newTransactions) {
        const existingTx = await getTransactionByHash(tx.txHash);
        if (!existingTx) {
          await addTransaction(tx);
          addedTransactions = true;
        }
      }

      // ✅ If new transactions were added, refresh state
      if (addedTransactions) {
        const updatedTxs = await getAllTransactions();
        setTransactionState(updatedTxs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Fetch Latest Block Number
  const fetchLatestBlock = async () => {
    if (!publicClient) return;
    try {
      const block = await publicClient.getBlockNumber();
      setLatestBlock(block);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Always Fetch Transactions on Load (Background Update)
  useEffect(() => {
    fetchTransactions(); // ✅ Fetch new transactions in the background
    fetchLatestBlock();
  }, [publicClient]);

  // ✅ Watch Real-Time Transactions & Store in IndexedDB
  const processRealTimeEvent = async (event: TokenSwapEvent, action: "Deposit" | "Withdraw") => {
    const txHash = event.transactionHash;
    if (!processedLogs.current.has(txHash)) {
      processedLogs.current.add(txHash);
      const newTransaction = {
        txHash,
        timestamp: BigInt(new Date().getTime()),
        date: new Date().toLocaleString(),
        action,
        amount: formatUnits(event.args.usdcAmount, DECIMAL_PLACES),
        user: event.args.owner,
      };

      const existingTx = await getTransactionByHash(txHash);
      if (!existingTx) {
        await addTransaction(newTransaction);
        setTransactionState([...transactionState, newTransaction]);
      }
    }
  };

  useWatchContractEvent({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolAbi,
    eventName: "TokensSwapped",
    fromBlock: latestBlock,
    onLogs(logs) {
      logs.forEach((log) => {
        const event = log as never as TokenSwapEvent;
        processRealTimeEvent(event, "Deposit");
      });
    },
  });

  useWatchContractEvent({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: LiquidityPoolAbi,
    eventName: "TokensRedeemed",
    fromBlock: latestBlock,
    onLogs(logs) {
      logs.forEach((log) => {
        const event = log as never as TokenSwapEvent;
        processRealTimeEvent(event, "Withdraw");
      });
    },
  });

  return transactionState;
}
