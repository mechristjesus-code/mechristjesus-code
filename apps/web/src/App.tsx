import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import DNAProfile from './pages/DNAProfile';
import AITools from './pages/AITools';

function App() {
  // Mock auth state
  const isAuthenticated = true;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/dna" element={<DNAProfile />} />
        <Route path="/ai" element={<AITools />} />
      </Route>
    </Routes>
  );
}

export default App;
