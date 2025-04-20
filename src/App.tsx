import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import StudyPage from './pages/StudyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import PomodoroPage from './pages/PomodoroPage';
import AthroChat from './pages/AthroChat';
import OnboardingPage from './pages/OnboardingPage';
import AthroOnboardingPage from './pages/AthroOnboardingPage';
import WelcomePage from './pages/WelcomePage';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/athro-onboarding" element={<AthroOnboardingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/athro-chat" element={<AthroChat />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
