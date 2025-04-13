
import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AthroSelectorPage from './athro/AthroSelectorPage';
import AthroMathsPage from './athro/AthroMathsPage';
import AthroSciencePage from './athro/AthroSciencePage';
import AthroEnglishPage from './athro/AthroEnglishPage';
import AthroWelshPage from './athro/AthroWelshPage';
import AthroLanguagesPage from './athro/AthroLanguagesPage';
import AthroHistoryPage from './athro/AthroHistoryPage';
import AthroGeographyPage from './athro/AthroGeographyPage';
import AthroREPage from './athro/AthroREPage';
import AthroSystem from '@/components/AthroSystem';
import { useAuth } from '@/contexts/AuthContext';

const AthroPage: React.FC = () => {
  const { state } = useAuth();
  const { user, loading } = state;
  const navigate = useNavigate();
  
  // If we're still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <p className="text-gray-600">Setting up your Athro experience</p>
        </div>
      </div>
    );
  }
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // For teachers and admins, redirect to teacher dashboard
  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher-dashboard" replace />;
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
        <Route path="/english" element={<AthroEnglishPage />} />
        <Route path="/welsh" element={<AthroWelshPage />} />
        <Route path="/languages" element={<AthroLanguagesPage />} />
        <Route path="/history" element={<AthroHistoryPage />} />
        <Route path="/geography" element={<AthroGeographyPage />} />
        <Route path="/re" element={<AthroREPage />} />
        <Route path="*" element={<Navigate to="/athro/select" replace />} />
      </Routes>
      <AthroSystem />
    </>
  );
};

export default AthroPage;
