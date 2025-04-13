
import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';

const AthroPage: React.FC = () => {
  const { state } = useAuth();
  const { user, loading } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    // Once auth state is determined, mark the page as loaded
    if (!loading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // If we're still loading, show a loading indicator
  if (loading || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <h2 className="text-xl font-semibold mt-4 mb-2">Preparing Your Athro Experience</h2>
          <p className="text-gray-600">Loading study materials and preferences...</p>
        </div>
      </div>
    );
  }
  
  // If no user, redirect to login
  if (!user) {
    console.warn("AthroPage: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // For teachers and admins, redirect to teacher dashboard
  if (user.role === 'teacher' || user.role === 'admin') {
    console.log("AthroPage: Teacher/admin detected, redirecting to teacher dashboard");
    return <Navigate to="/teacher" replace />;
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
      
      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 text-xs rounded opacity-70 hover:opacity-100 max-w-xs">
          <div><strong>Path:</strong> {location.pathname}</div>
          <div><strong>User:</strong> {user?.email}</div>
          <div><strong>Role:</strong> {user?.role}</div>
        </div>
      )}
    </>
  );
};

export default AthroPage;
