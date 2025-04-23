
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarAuthCheck from '@/components/calendar/states/CalendarAuthCheck';
import CalendarWrapper from '@/components/calendar/CalendarWrapper';

const CalendarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const shouldRefresh = searchParams.get('refresh') === 'true';
  const isRestartingOnboarding = searchParams.get('restart') === 'true';
  
  const handleRestartOnboarding = useCallback(() => {
    window.location.href = '/onboarding?restart=true';
  }, []);

  if (isRestartingOnboarding) {
    handleRestartOnboarding();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarAuthCheck fromSetup={fromSetup}>
        <CalendarWrapper
          fromSetup={fromSetup}
          shouldRefresh={shouldRefresh}
          onRestartOnboarding={handleRestartOnboarding}
        />
      </CalendarAuthCheck>
    </div>
  );
};

export default CalendarPage;
