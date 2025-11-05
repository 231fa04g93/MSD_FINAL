import React, { useState, useEffect, useRef } from 'react';
import { transactionService } from '../services/transactionService.js';
import { isAuthenticated } from '../services/api.js';
import ExpenseLimitManager from './ExpenseLimitManager.jsx';
import ExpenseAnalytics from './ExpenseAnalytics.jsx';
import NotificationContainer from './NotificationContainer.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

const DashboardPage = ({ showNotification, user, setCurrentPage }) => {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);

  // Notification system
  const {
    notifications,
    removeNotification,
    notifyTransactionAdded,
    notifyTransactionDeleted,
    checkExpenseLimits
  } = useNotifications();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!isAuthenticated()) {
          setError('Please log in to view your transactions');
          setLoading(false);
          return;
        }
        setLoading(true);
        setError('');
        const fetchedTransactions = await transactionService.fetchTransactions();
        setTransactions(fetchedTransactions);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() === '' || amount.trim() === '') {
      setError('Please enter both description and amount');
      return;
    }
    if (isEditing) {
      setError('Edit functionality will be implemented soon');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const newTransaction = await transactionService.addTransaction({
        text: text.trim(),
        amount: parseFloat(amount)
      });
      setTransactions([newTransaction, ...transactions]);
      setText('');
      setAmount('');

      // Notify about the new transaction
      notifyTransactionAdded(newTransaction);
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const transactionToEdit = transactions.find((t) => t.id === id);
    setText(transactionToEdit.text);
    setAmount(transactionToEdit.amount);
    setIsEditing(true);
  };

  const removeTransaction = async (id) => {
    try {
      setError('');
      const transactionToDelete = transactions.find(t => t._id === id);
      setTransactions(transactions.filter((t) => t._id !== id));
      await transactionService.deleteTransaction(id);

      // Notify about the deleted transaction
      if (transactionToDelete) {
        notifyTransactionDeleted(transactionToDelete);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  const quickAddSalary = () => {
    setText('Salary');
    setAmount('');
    amountRef.current?.focus();
  };

  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter((item) => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
  const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLimitUpdate = () => {
    // Immediate limit check without delay
    checkExpenseLimits();
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen w-full">
      <div className="w-full px-8 py-6">
        <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage && setCurrentPage('profile')}
                className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-3xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105"
                title="View Profile"
              >
                <span className="text-2xl font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {getGreeting()}, {user?.name || 'User'}! 
                </h1>
                <p className="text-gray-600 text-lg">Financial Dashboard & Analytics</p>
              </div>
            </div>
            <div className="text-right bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
              <h4 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">Current Balance</h4>
              <h2 className={`text-4xl font-bold mb-3 ${parseFloat(total) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {total}
              </h2>
              <div className="flex space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-emerald-600 font-semibold mb-1">Income</p>
                  <p className="text-emerald-700 font-medium">{income}</p>
                </div>
                <div className="text-center">
                  <p className="text-red-600 font-semibold mb-1">Expenses</p>
                  <p className="text-red-700 font-medium">{expense}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-5 xl:grid-cols-4 gap-8">
          <div className="2xl:col-span-1 xl:col-span-1">
            <div className="bg-white shadow-xl rounded-3xl p-8 mb-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white"></span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Transaction</h2>
                <p className="text-gray-600 text-sm">Record your income and expenses</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-semibold">Description</label>
                    <button
                      type="button"
                      onClick={quickAddSalary}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                    >
                      + Quick Salary
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Salary, Grocery, Restaurant..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-semibold">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold"></span>
                    <input
                      type="number"
                      ref={amountRef}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-8 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                     Use negative values for expenses (-500) and positive for income (+5000)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isEditing
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                    }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </span>
                  ) : isEditing ? (
                    ' Update Transaction'
                  ) : (
                    ' Add Transaction'
                  )}
                </button>
              </form>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center">
                  <span className="text-red-500 mr-2"></span>
                  {error}
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-2 text-white text-sm"></span>
                  Quick Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-emerald-600 font-semibold text-sm mb-1">Total Income</p>
                    <p className="text-emerald-700 font-bold text-lg">{income}</p>
                  </div>
                  <div className="text-center bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-red-600 font-semibold text-sm mb-1">Total Expenses</p>
                    <p className="text-red-700 font-bold text-lg">{expense}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="2xl:col-span-4 xl:col-span-3 space-y-8">
            <ExpenseLimitManager
              showNotification={showNotification}
              onLimitUpdate={handleLimitUpdate}
              transactionCount={transactions.length}
            />

            <ExpenseAnalytics
              showNotification={showNotification}
              refreshTrigger={transactions.length}
            />
          </div>
        </div>

        <div className="mt-12 bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl"></span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Transaction Records</h2>
                  <p className="text-gray-600">Complete history of all your financial transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-500 text-lg">Loading transaction records...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-gray-400"></span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first income or expense transaction above</p>
                <button
                  onClick={() => document.querySelector('input[type="text"]')?.focus()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Add First Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                      Income
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Expense
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 p-6 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${transaction.amount >= 0
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                            : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                            }`}>
                            <span className="text-2xl">
                              {transaction.amount >= 0 ? '' : ''}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{transaction.text}</h4>
                            <p className="text-gray-500 text-sm">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}  {new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className={`text-2xl font-bold ${transaction.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                              {transaction.amount >= 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('en-IN')}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {transaction.amount >= 0 ? 'Income' : 'Expense'}
                            </p>
                          </div>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(transaction._id)}
                              className="w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                              title="Edit Transaction"
                            >
                              <span className="text-sm"></span>
                            </button>
                            <button
                              onClick={() => removeTransaction(transaction._id)}
                              className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                              title="Delete Transaction"
                            >
                              <span className="text-sm"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationContainer
        notifications={notifications}
        onNotificationDismiss={removeNotification}
        position="top-right"
      />
    </div>
  );
};

export default DashboardPage;
