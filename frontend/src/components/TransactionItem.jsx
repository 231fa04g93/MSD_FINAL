import React from 'react';

const TransactionItem = ({ transaction, removeTransaction, handleEdit }) => {
  const sign = transaction.amount < 0 ? '-' : '+';

  return (
    <li
      className={`flex justify-between items-center p-3 border-l-4 rounded-md shadow-sm ${
        transaction.amount < 0 ? 'border-red-500' : 'border-green-500'
      }`}
    >
      <span className="text-gray-700 font-medium">{transaction.text}</span>
      <div className="flex items-center gap-3">
        <span className="text-gray-800 font-semibold">
          {sign}₹{Math.abs(transaction.amount)}
        </span>
        <button
          onClick={() => handleEdit(transaction._id)}
          className="text-blue-500 hover:text-blue-700 font-bold"
        >
          ✎
        </button>
        <button
          onClick={() => removeTransaction(transaction._id)}
          className="text-red-500 hover:text-red-700 font-bold"
        >
          ✖
        </button>
      </div>
    </li>
  );
};

export default TransactionItem;
