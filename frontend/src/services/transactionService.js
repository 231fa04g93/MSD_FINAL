import API from './api.js';

export const transactionService = {
  async fetchTransactions() {
    try {
      const response = await API.get('/transactions');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch transactions');
    }
  },

  async addTransaction(transactionData) {
    try {
      if (!transactionData.text || transactionData.amount === undefined) {
        throw new Error('Text and amount are required');
      }
      const response = await API.post('/transactions', {
        text: transactionData.text.trim(),
        amount: parseFloat(transactionData.amount)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to add transaction');
    }
  },

  async deleteTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
      const response = await API.delete(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete transaction');
    }
  },

  handleError(error, defaultMessage) {
    if (error.response) {
      const serverMessage = error.response.data?.msg || error.response.data?.message;
      const errors = error.response.data?.errors;
      if (errors && Array.isArray(errors)) {
        return new Error(errors.join(', '));
      } else if (serverMessage) {
        return new Error(serverMessage);
      } else {
        return new Error(`${defaultMessage} (Status: ${error.response.status})`);
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection and try again.');
    } else {
      return new Error(error.message || defaultMessage);
    }
  }
};

export default transactionService;
