// =======================
// Required Modules
// =======================
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User.model');
const Transaction = require('./models/Transaction.model'); // <--- Added (since you use Transaction)
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transactions.routes');

// =======================
// Configurations
// =======================
dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('👉 Please check your .env file');
  process.exit(1);
}

// =======================
// Express App Setup
// =======================
const app = express();
app.use(cors());
app.use(express.json());

// =======================
// MongoDB Connection
// =======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.log('❌ DB connection error:', err));

// =======================
// Routes
// =======================
app.get('/', (req, res) => res.send('Expense Tracker API Running'));

app.get('/api', (req, res) =>
  res.json({
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: '/api/auth/signup',
      login: '/api/auth/login'
    }
  })
);

// Seed users
app.get('/user', async (req, res) => {
  try {
    const users = [
      { name: 'Ayush Singh', email: 'a@gmail.com', password: '123' },
      { name: 'Varshini Allam', email: 'v@gmail.com', password: '123' },
      { name: 'V.Y. Somya', email: 's@gmail.com', password: '123' },
      { name: 'Sindhu Meghana', email: 'm@gmail.com', password: '123' }
    ];
    await User.deleteMany({});
    const result = await User.insertMany(users);
    res.status(200).json({ message: 'Users added successfully!', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding users' });
  }
});

// Seed transactions
app.get('/trans', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(400).json({ error: 'No user found to assign transactions' });

    const transactions = [
      { user: user._id, text: 'Salary credited', amount: 50000 },
      { user: user._id, text: 'Grocery shopping', amount: -3200 },
      { user: user._id, text: 'Electricity bill', amount: -1500 },
      { user: user._id, text: 'Freelance project payment', amount: 12000 },
    ];

    await Transaction.deleteMany({});
    const result1 = await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Transactions added successfully!', result1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding transactions' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// =======================
// Server Start
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
