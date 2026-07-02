import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Welcome to Manus Demo App</h1>
    <p className="mt-4 text-gray-600">A full-stack task management demonstration.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="font-bold text-xl text-blue-600">Manus Demo</span>
            <div className="space-x-4">
              <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
              <a href="/tasks" className="text-gray-700 hover:text-blue-600">Tasks</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
