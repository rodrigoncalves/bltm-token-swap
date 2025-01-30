import React, { useEffect, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';

type SortKey = 'date' | 'action' | 'amount' | 'user';
type SortOrder = 'asc' | 'desc';

const TransactionHistory = () => {
  const transactions = useTransactions();
  const [sortField, setSortField] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle sorting when clicking headers
  const handleSort = (field: SortKey) => {
    setSortOrder(prevOrder => (sortField === field && prevOrder === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  // Sort transactions dynamically
  const sortedTransactions = [...transactions].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'amount') {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter transactions across all fields using debounced search value
  const filteredTransactions = sortedTransactions.filter(tx =>
    Object.values(tx).some(val => val.toString().toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Debounce effect: Waits 300ms before setting the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Transaction History</h3>

      {/* Search Bar */}
      <div className="mb-2 flex justify-between items-center" style={{ color: 'black' }}>
        <input
          type="text"
          placeholder="Search by user address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Transaction Table */}
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
          {paginatedTransactions.map((tx, index) => (
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

      {/* Rows Per Page Selector */}
      <div className="mt-2 flex justify-end items-center gap-4" style={{ color: 'black' }}>
        <span style={{ color: 'white' }}>Show</span>
        <select
          value={rowsPerPage}
          onChange={e => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="p-2 border rounded"
        >
          <option value="5">5 rows</option>
          <option value="10">10 rows</option>
          <option value="20">20 rows</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage > totalPages ? totalPages : currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
