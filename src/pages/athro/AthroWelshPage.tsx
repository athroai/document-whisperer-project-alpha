
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

const AthroWelshPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const welshCharacter = getAthroBySubject('Welsh');
    if (welshCharacter) {
      setActiveCharacter(welshCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]); // Added both dependencies to prevent infinite rendering
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AthroWelsh</h1>
          <p className="text-muted-foreground">
            {language === 'cy' 
              ? 'Eich mentor Cymraeg ar gyfer TGAU'
              : 'Your Welsh language mentor for GCSE'
            }
          </p>
        </div>
        <LanguageSwitcher />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase showTopicSelector={true} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">{t('athro.aboutTitle', { name: 'AthroWelsh' })}</h2>
            <p className="text-sm text-muted-foreground">
              {language === 'cy' 
                ? 'Bydd AthroWelsh yn eich helpu i ddatblygu eich sgiliau iaith Gymraeg ar gyfer arholiadau TGAU, gan gynnwys siarad, ysgrifennu, a deall.'
                : 'AthroWelsh will help you develop your Welsh language skills for GCSE exams, including speaking, writing, and comprehension.'
              }
            </p>
            
            <h3 className="font-medium mt-4 mb-2">
              {language === 'cy' ? 'Nodweddion a Gefnogir:' : 'Supported Features:'}
            </h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>{language === 'cy' ? 'Cefnogaeth iaith Gymraeg' : 'Welsh language support'}</li>
              <li>{language === 'cy' ? 'Esboniadau gramadegol' : 'Grammar explanations'}</li>
              <li>{language === 'cy' ? 'Ymarfer geirfa' : 'Vocabulary practice'}</li>
              <li>{language === 'cy' ? 'Technegau ysgrifennu' : 'Writing techniques'}</li>
              <li>{language === 'cy' ? 'Dadansoddiad llenyddol' : 'Literature analysis'}</li>
              <li>{language === 'cy' ? 'Ymarfer papurau arholiad' : 'Past paper practice'}</li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">
              {language === 'cy' ? 'Byrddau Arholi' : 'Exam Boards'}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                WJEC
              </span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">
              {language === 'cy' ? 'Awgrymiadau Astudio' : 'Study Tips'}
            </h2>
            <ul className="text-sm space-y-2 list-disc pl-4">
              <li>
                {language === 'cy' 
                  ? 'Ymarfer sgyrsiau yn Gymraeg gyda AthroWelsh'
                  : 'Practice conversations in Welsh with AthroWelsh'
                }
              </li>
              <li>
                {language === 'cy' 
                  ? 'Gofyn am gymorth gyda gramadeg a geirfa'
                  : 'Ask for help with grammar and vocabulary'
                }
              </li>
              <li>
                {language === 'cy' 
                  ? 'Cael adborth ar eich ysgrifennu Cymraeg'
                  : 'Get feedback on your Welsh writing'
                }
              </li>
              <li>
                {language === 'cy' 
                  ? 'Adolygu llenyddiaeth Gymraeg gydag esboniadau'
                  : 'Review Welsh literature with guided explanations'
                }
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroWelshPage;
