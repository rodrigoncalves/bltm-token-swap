import { useTransactions } from '../hooks/useTransactions';

export default function TransactionHistory() {
  const transactions = useTransactions();
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Transaction History</h3>
      <table className="table-auto w-full border-collapse border border-gray-800">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="border border-gray-800 px-4 py-2">#</th>
            <th className="border border-gray-800 px-4 py-2">Date</th>
            <th className="border border-gray-800 px-4 py-2">Action</th>
            <th className="border border-gray-800 px-4 py-2">Amount</th>
            <th className="border border-gray-800 px-4 py-2">User</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index} className="border border-gray-800 text-center">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{tx.date}</td>
              <td className="px-4 py-2">{tx.action}</td>
              <td className="px-4 py-2">{tx.amount}</td>
              <td className="px-4 py-2">
                {tx.user?.slice(0, 6)}...{tx.user?.slice(-4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
