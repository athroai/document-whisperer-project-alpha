
import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AthroSelectorPage from './athro/AthroSelectorPage';
import AthroMathsPage from './athro/AthroMathsPage';
import AthroSciencePage from './athro/AthroSciencePage';
import AthroSystem from '@/components/AthroSystem';
import { useAuth } from '@/contexts/AuthContext';

const AthroPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to the selector if we're at the root /athro path
  useEffect(() => {
    if (location.pathname === '/athro' || location.pathname === '/athro/') {
      navigate('/athro/select', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // Fail-safe - if we somehow get here without being logged in
  if (!user) {
    console.log("No user found in AthroPage, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/athro/select" replace />} />
        <Route path="/select" element={<AthroSelectorPage />} />
        <Route path="/maths" element={<AthroMathsPage />} />
        <Route path="/mathematics" element={<AthroMathsPage />} />
        <Route path="/science" element={<AthroSciencePage />} />
        <Route path="*" element={<Navigate to="/athro/select" replace />} />
      </Routes>
      <AthroSystem />
    </>
  );
};

export default AthroPage;
