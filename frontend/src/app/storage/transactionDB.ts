import Dexie, { Table } from "dexie";

// Define transaction structure
export interface Transaction {
  id?: number;
  txHash: string;
  timestamp: bigint;
  date: string;
  action: string;
  amount: string;
  user: string;
}

// Create a new Dexie database
class TransactionDatabase extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super("TransactionDB");
    this.version(1).stores({
      transactions: "++id, txHash, timestamp, date, action, amount, user", // `id` is auto-incremented
    });
  }
}

// Export the database instance
export const db = new TransactionDatabase();
