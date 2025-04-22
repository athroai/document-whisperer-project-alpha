
import { useState, useEffect } from 'react';
import { useUserSubjects } from './useUserSubjects';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const GCSE_SUBJECTS = [
  'Mathematics', 
  'English Language', 
  'English Literature',
  'Biology', 
  'Chemistry', 
  'Physics',
  'Combined Science',
  'History', 
  'Geography',
  'Computer Science',
  'French',
  'Spanish',
  'German',
  'Religious Studies',
  'Art & Design',
  'Music',
  'Drama',
  'Physical Education',
  'Business Studies'
];

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [usingDefaultSubjects, setUsingDefaultSubjects] = useState(false);
  
  const { 
    subjects: userSubjects, 
    isLoading: isLoadingUserSubjects,
    noSubjectsFound
  } = useUserSubjects();
  
  // Try to access onboarding context if available
  let onboardingSubjects: any[] = [];
  try {
    const { selectedSubjects } = useOnboarding();
    onboardingSubjects = selectedSubjects;
  } catch (e) {
    // Onboarding context not available, which is fine
    console.log("Onboarding context not available in this component");
  }
  
  useEffect(() => {
    if (!isLoadingUserSubjects) {
      if (userSubjects && userSubjects.length > 0) {
        console.log("Setting subjects from user subjects:", userSubjects.map(s => s.subject));
        setSubjects(userSubjects.map(s => s.subject));
        setUsingDefaultSubjects(false);
        // Clear any cache of default subjects if we have real user subjects
        localStorage.removeItem('default_subjects_used');
      } else if (onboardingSubjects && onboardingSubjects.length > 0) {
        // If no database subjects but onboarding subjects exist, use those
        console.log("Setting subjects from onboarding:", onboardingSubjects.map(s => s.subject));
        setSubjects(onboardingSubjects.map(s => s.subject));
        setUsingDefaultSubjects(false);
        localStorage.removeItem('default_subjects_used');
      } else if (noSubjectsFound) {
        console.log("No user subjects found, checking if we should use default subjects");
        // Don't set any default subjects if we're still in onboarding
        if (window.location.pathname.includes('onboarding')) {
          setSubjects([]);
        } else {
          // Only use default subjects if we haven't already populated the database
          if (!localStorage.getItem('default_subjects_used')) {
            console.log("Using default subjects");
            setSubjects(GCSE_SUBJECTS.slice(0, 5)); // Just use first 5 default subjects
            localStorage.setItem('default_subjects_used', 'true');
          } else {
            // If we've already tried using defaults but now have no subjects, clear the subjects
            console.log("Previously used default subjects, but now no subjects found");
            setSubjects([]);
          }
        }
        setUsingDefaultSubjects(true);
      }
    }
  }, [userSubjects, isLoadingUserSubjects, noSubjectsFound, onboardingSubjects]);
  
  return { 
    subjects, 
    isLoading: isLoadingUserSubjects,
    usingDefaultSubjects,
    allSubjects: GCSE_SUBJECTS
  };
};
