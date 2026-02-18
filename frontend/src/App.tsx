import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Scan from './pages/Scan';
import Login from './pages/Login';
import Register from './pages/Register';
import Community from './pages/Community';
import Chat from './pages/Chat';
import AiChat from './pages/AiChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat/ai" element={<AiChat />} />
              <Route path="/chat/:userId" element={<Chat />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
