import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import ToolsPage from './pages/ToolsPage';

function App() {
  const user = useAuthStore(state => state.user);

  return (
    <Routes>
      <Route path="/" element={user ? <ChatPage /> : <Navigate to="/auth" replace />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
      <Route path="/tools" element={user ? <ToolsPage /> : <Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
