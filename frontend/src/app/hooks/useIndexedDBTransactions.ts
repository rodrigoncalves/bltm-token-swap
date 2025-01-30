import { db, Transaction } from "../storage/transactionDB";

export function useIndexedDBTransactions() {

  // Get all transactions (immediately loads from IndexedDB)
  const getAllTransactions = async (): Promise<Transaction[]> => {
    return await db.transactions.toArray();
  };

  // Add a transaction to IndexedDB
  const addTransaction = async (transaction: Transaction) => {
    await db.transactions.add(transaction);
  };

  // Get a specific transaction by hash
  const getTransactionByHash = async (txHash: string): Promise<Transaction | undefined> => {
    return await db.transactions.where("txHash").equals(txHash).first();
  };


  return { getAllTransactions, addTransaction, getTransactionByHash };
}
