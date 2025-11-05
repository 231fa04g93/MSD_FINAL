const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (name && name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      msg: 'Validation failed',
      errors: errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      msg: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin
};
