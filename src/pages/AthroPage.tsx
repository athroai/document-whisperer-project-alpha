
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AthroSelectorPage from './athro/AthroSelectorPage';
import AthroMathsPage from './athro/AthroMathsPage';
import AthroSciencePage from './athro/AthroSciencePage';
import AthroSystem from '@/components/AthroSystem';

const AthroPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<AthroSelectorPage />} />
        <Route path="/mathematics" element={<AthroMathsPage />} />
        <Route path="/science" element={<AthroSciencePage />} />
        <Route path="*" element={<Navigate to="/athro" replace />} />
      </Routes>
      <AthroSystem />
    </>
  );
};

export default AthroPage;
