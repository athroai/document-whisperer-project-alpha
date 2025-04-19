
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import ChatOnboardingPage from './pages/ChatOnboardingPage';
import ChatPage from './pages/ChatPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Nav from './components/Nav';
import RequireAuth from './components/RequireAuth';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const { state, dispatch } = useAuth();
  
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: session.user.id,
            email: session.user.email!,
            role: 'student',
          }
        });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });
  }, [dispatch]);

  return (
    <Router>
      <Nav />
      <main className="pt-16 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/chat-onboarding" element={<RequireAuth><ChatOnboardingPage /></RequireAuth>} />
          <Route path="/chat/:characterId?" element={<RequireAuth><ChatPage /></RequireAuth>} />
          <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        </Routes>
      </main>
      <Toaster />
    </Router>
  );
}

export default App;
