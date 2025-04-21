
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';

const AthroMathsPage: React.FC = () => {
  const { characters, setActiveCharacter } = useAthro();

  useEffect(() => {
    // Find the Mathematics character and set it as active
    const mathsCharacter = characters.find(char => char.subject === 'Mathematics');
    if (mathsCharacter) {
      setActiveCharacter(mathsCharacter);
    }
  }, [characters, setActiveCharacter]);

  return <div>Maths Athro Page</div>;
};

export default AthroMathsPage;
