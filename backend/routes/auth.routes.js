const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { validateSignup, validateLogin } = require('../middleware/validation');

router.post('/signup', validateSignup, async (req, res) => {
  const startTime = Date.now();

  console.log('Timestamp:', new Date().toISOString());
  console.log('Request body received:', {
    name: req.body.name ? 'Present' : 'Missing',
    email: req.body.email ? req.body.email : 'Missing',
    password: req.body.password ? 'Present (hidden)' : 'Missing'
  });

  const { name, email, password } = req.body;

  try {
    console.log('Step 1: Checking if user already exists...');
    let user = await User.findOne({ email });
    console.log('Database query result:', user ? 'User exists' : 'User not found');
    
    if (user) {
      console.log('Signup failed: User already exists');
      console.log('Request completed in:', Date.now() - startTime, 'ms');
      return res.status(400).json({ msg: 'User already exists' });
    }

    console.log('Step 2: Creating new user object...');
    user = new User({ name, email, password });
    console.log('User object created:', {
      name: user.name,
      email: user.email,
      hasPassword: !!user.password
    });

    console.log('Step 3: Hashing password...');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    console.log('Step 4: Saving user to database...');
    const savedUser = await user.save();
    console.log('User saved successfully');
    console.log('Saved user details:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.date
    });

    console.log('Step 5: Generating JWT token...');
    const payload = { user: { id: savedUser.id } };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing failed:', err);
          throw err;
        }
        console.log('JWT token generated successfully');
        console.log('Total request time:', Date.now() - startTime, 'ms');
        console.log('Signup request completed successfully\n');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Failed after:', Date.now() - startTime, 'ms');
   
    res.status(500).json({ 
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  const startTime = Date.now();
  
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request body received:', {
    email: req.body.email ? req.body.email : 'Missing',
    password: req.body.password ? 'Present (hidden)' : 'Missing'
  });

  const { email, password } = req.body;
  console.log(req.body);

  try {
    console.log('Step 1: Looking up user by email...');
    let user = await User.findOne({ email });
    console.log('Database query result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('Login failed: User not found');
      console.log('Request completed in:', Date.now() - startTime, 'ms');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      hasPassword: !!user.password
    });

    console.log('Step 2: Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password verification:', isMatch ? 'Match' : 'No match');
    
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      console.log('Request completed in:', Date.now() - startTime, 'ms');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('Step 3: Generating JWT token...');
    const payload = { user: { id: user.id } };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing failed:', err);
          throw err;
        }
        console.log('JWT token generated successfully');
        console.log('Total request time:', Date.now() - startTime, 'ms');
        console.log('Login request completed successfully\n');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login request failed');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Failed after:', Date.now() - startTime, 'ms');
    res.status(500).json({ 
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
