import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';

type SortKey = 'date' | 'action' | 'amount' | 'user';
type SortOrder = 'asc' | 'desc';

const TransactionHistory = () => {
  const transactions = useTransactions();
  const [sortField, setSortField] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Handle sorting when clicking headers
  const handleSort = (field: SortKey) => {
    setSortOrder(prevOrder => (sortField === field && prevOrder === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  // Sort transactions dynamically
  const sortedTransactions = [...transactions].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    // Convert to numbers if sorting by amount
    if (sortField === 'amount') {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Transaction History</h3>
      <table className="table-auto w-full border-collapse border border-gray-800">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="border border-gray-800 px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
              Date {sortField === 'date' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th className="border border-gray-800 px-4 py-2 cursor-pointer" onClick={() => handleSort('action')}>
              Action {sortField === 'action' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th className="border border-gray-800 px-4 py-2 cursor-pointer" onClick={() => handleSort('amount')}>
              Amount {sortField === 'amount' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th className="border border-gray-800 px-4 py-2 cursor-pointer" onClick={() => handleSort('user')}>
              User {sortField === 'user' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((tx, index) => (
            <tr key={index} className="border border-gray-800 text-center">
              <td className="px-4 py-2">{new Date(tx.date).toLocaleString()}</td>
              <td className="px-4 py-2">{tx.action}</td>
              <td className="px-4 py-2">{tx.amount}</td>
              <td className="px-4 py-2">
                {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
