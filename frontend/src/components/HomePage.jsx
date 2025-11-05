const HomePage = ({ setCurrentPage }) => (
  <div className="text-center">
    <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Your Expense Tracker</h1>
    <p className="text-xl text-gray-600 mb-8">
      Take control of your finances with a simple, intuitive interface.
    </p>
    <div className="space-x-4">
      <button
        onClick={() => setCurrentPage('signup')}
        className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition-colors duration-300 shadow-md"
      >
        Get Started
      </button>
      <button
        onClick={() => setCurrentPage('login')}
        className="bg-white text-gray-800 font-bold py-3 px-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-300"
      >
        Login
      </button>
    </div>
  </div>
);

export default HomePage;
