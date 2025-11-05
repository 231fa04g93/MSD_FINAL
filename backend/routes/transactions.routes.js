const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');

router.get('/', auth, async (req, res) => {
  const startTime = Date.now();
  console.log('=== FETCH TRANSACTIONS REQUEST STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user.id);

  try {
    console.log('Step 1: Fetching transactions from database...');
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log('Database query successful');
    console.log('Found transactions:', transactions.length);
    console.log('Transaction summary:', {
      total: transactions.length,
      income: transactions.filter(t => t.amount > 0).length,
      expenses: transactions.filter(t => t.amount < 0).length
    });
    console.log('Request completed in:', Date.now() - startTime, 'ms');
    console.log('=== FETCH TRANSACTIONS COMPLETED SUCCESSFULLY ===');
    res.json(transactions);
  } catch (err) {
    console.error('=== FETCH TRANSACTIONS REQUEST FAILED ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Failed after:', Date.now() - startTime, 'ms');
    res.status(500).json({
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

router.post('/', auth, async (req, res) => {
  const startTime = Date.now();
  console.log('=== CREATE TRANSACTION REQUEST STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user.id);
  console.log('Request body received:', {
    text: req.body.text ? `"${req.body.text}"` : 'Missing',
    amount: req.body.amount !== undefined ? req.body.amount : 'Missing'
  });

  const { text, amount } = req.body;

  if (!text || !amount) {
    console.log('Validation failed: Missing required fields');
    console.log('Request failed in:', Date.now() - startTime, 'ms');
    return res.status(400).json({
      msg: 'Please provide both text and amount',
      errors: [
        !text && 'Text is required',
        !amount && 'Amount is required'
      ].filter(Boolean)
    });
  }

  try {
    console.log('Step 1: Creating new transaction object...');
    const newTransaction = new Transaction({
      text,
      amount: parseFloat(amount),
      user: req.user.id,
    });
    console.log('Transaction object created:', {
      text: newTransaction.text,
      amount: newTransaction.amount,
      user: newTransaction.user,
      type: newTransaction.amount > 0 ? 'Income' : 'Expense'
    });

    console.log('Step 2: Saving transaction to database...');
    const transaction = await newTransaction.save();
    console.log('Transaction saved successfully');
    console.log('Saved transaction details:', {
      id: transaction._id,
      text: transaction.text,
      amount: transaction.amount,
      createdAt: transaction.createdAt
    });
    console.log('Total request time:', Date.now() - startTime, 'ms');
    console.log('=== CREATE TRANSACTION COMPLETED SUCCESSFULLY ===');
    res.json(transaction);
  } catch (err) {
    console.error('=== CREATE TRANSACTION REQUEST FAILED ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Failed after:', Date.now() - startTime, 'ms');
    res.status(500).json({
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const startTime = Date.now();
  console.log('=== DELETE TRANSACTION REQUEST STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user.id);
  console.log('Transaction ID:', req.params.id);

  try {
    console.log('Step 1: Finding transaction by ID...');
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      console.log('Transaction not found in database');
      console.log('Request completed in:', Date.now() - startTime, 'ms');
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    console.log('Transaction found:', {
      id: transaction._id,
      text: transaction.text,
      amount: transaction.amount,
      owner: transaction.user
    });

    console.log('Step 2: Verifying transaction ownership...');
    if (transaction.user.toString() !== req.user.id) {
      console.log('Authorization failed: User does not own this transaction');
      console.log('Owner ID:', transaction.user.toString());
      console.log('Requesting User ID:', req.user.id);
      console.log('Request completed in:', Date.now() - startTime, 'ms');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    console.log('Authorization verified: User owns the transaction');
    console.log('Step 3: Deleting transaction from database...');
    await Transaction.findByIdAndDelete(req.params.id);
    console.log('Transaction deleted successfully');
    console.log('Total request time:', Date.now() - startTime, 'ms');
    console.log('=== DELETE TRANSACTION COMPLETED SUCCESSFULLY ===');
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error('=== DELETE TRANSACTION REQUEST FAILED ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Failed after:', Date.now() - startTime, 'ms');
    res.status(500).json({
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
