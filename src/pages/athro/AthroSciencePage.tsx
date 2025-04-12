
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { getAthroBySubject } from '@/config/athrosConfig';
import AthroBase from '@/components/athro/AthroBase';

const AthroSciencePage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  
  useEffect(() => {
    const scienceCharacter = getAthroBySubject('Science');
    if (scienceCharacter) {
      setActiveCharacter(scienceCharacter);
    }
  }, [setActiveCharacter]);

  return (
    <div className="container mx-auto p-4">
      <AthroBase showTopicSelector={true} />
    </div>
  );
};

export default AthroSciencePage;
