
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AthroSelectorPage from './athro/AthroSelectorPage';
import AthroMathsPage from './athro/AthroMathsPage';
import AthroSystem from '@/components/AthroSystem';

const AthroPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<AthroSelectorPage />} />
        <Route path="/mathematics" element={<AthroMathsPage />} />
        <Route path="*" element={<Navigate to="/athro" replace />} />
      </Routes>
      <AthroSystem />
    </>
  );
};

export default AthroPage;
