
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AthroSelectorPage from './athro/AthroSelectorPage';
import AthroMathsPage from './athro/AthroMathsPage';
import AthroSubjectPage from './athro/AthroSubjectPage';
import AthroSystem from '@/components/AthroSystem';

const AthroPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<AthroSelectorPage />} />
        <Route path="/mathematics" element={<AthroMathsPage />} />
        {/* Add routes for other subjects using the generic component */}
        <Route path="/science" element={<AthroSubjectPage />} />
        <Route path="/english" element={<AthroSubjectPage />} />
        <Route path="/history" element={<AthroSubjectPage />} />
        <Route path="/welsh" element={<AthroSubjectPage />} />
        <Route path="/geography" element={<AthroSubjectPage />} />
        <Route path="/languages" element={<AthroSubjectPage />} />
        <Route path="/religious-education" element={<AthroSubjectPage />} />
        <Route path="/athroai" element={<AthroSubjectPage />} />
        <Route path="/timekeeper" element={<AthroSubjectPage />} />
        <Route path="/system" element={<AthroSubjectPage />} />
        <Route path="*" element={<Navigate to="/athro" replace />} />
      </Routes>
      <AthroSystem />
    </>
  );
};

export default AthroPage;
