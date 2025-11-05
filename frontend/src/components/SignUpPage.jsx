import React from 'react';
import { useState } from 'react';

const SignUpPage = ({ setCurrentPage, handleSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const onSubmit = (e) => {
    e.preventDefault();
    handleSignup(name, email, password);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Sign Up
      </h1>
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900">
          Sign Up
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentPage("login")}
            className="text-gray-800 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
};


export default SignUpPage;
