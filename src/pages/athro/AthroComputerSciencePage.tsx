
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroRouter from '@/components/athro/AthroRouter';

const AthroComputerSciencePage: React.FC = () => {
  const { setCurrentSubject } = useAthro();
  
  React.useEffect(() => {
    setCurrentSubject('Computer Science');
  }, [setCurrentSubject]);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Computer Science with AthroTech</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <AthroRouter />
      </div>
    </div>
  );
};

export default AthroComputerSciencePage;
