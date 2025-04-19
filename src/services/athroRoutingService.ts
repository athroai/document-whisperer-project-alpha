import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';

export interface RouterResponse {
  routeTo: 'onboarding' | 'home' | 'calendar' | 'subject' | 'error';
  reason: string;
  subjectId?: string;
}

export const checkUserOnboardingStatus = async (user: User | null): Promise<RouterResponse> => {
  if (!user) {
    return {
      routeTo: 'error',
      reason: 'User not authenticated'
    };
  }

  try {
    // Check for subjects in student_subjects table
    const { data: subjects, error: subjectsError } = await supabase
      .from('student_subjects')
      .select('id, subject_name')
      .eq('student_id', user.id);

    if (subjectsError) throw subjectsError;

    // If no subjects, route to onboarding
    if (!subjects || subjects.length === 0) {
      return {
        routeTo: 'onboarding',
        reason: 'No subjects found, user needs onboarding'
      };
    }

    // Check for any calendar events
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('student_id', user.id)
      .limit(1);

    if (eventsError) throw eventsError;

    // If no calendar events, route to calendar
    if (!events || events.length === 0) {
      return {
        routeTo: 'calendar',
        reason: 'No calendar events found, user should set up their calendar'
      };
    }

    // Otherwise, route to home
    return {
      routeTo: 'home',
      reason: 'User has completed onboarding and has calendar events'
    };
  } catch (error) {
    console.error('Error in routing check:', error);
    return {
      routeTo: 'error',
      reason: 'Error checking user status: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

export const routeToSubject = async (user: User | null, subjectName: string): Promise<RouterResponse> => {
  if (!user) {
    return {
      routeTo: 'error',
      reason: 'User not authenticated'
    };
  }

  try {
    // Check if the subject exists in athro_characters
    const { data: characters, error: charactersError } = await supabase
      .from('athro_characters')
      .select('id, subject')
      .ilike('subject', `%${subjectName}%`)
      .limit(1);

    if (charactersError) throw charactersError;

    // If subject found, route to it
    if (characters && characters.length > 0) {
      return {
        routeTo: 'subject',
        reason: `Routing to ${characters[0].subject} tutor`,
        subjectId: characters[0].id
      };
    }

    // If no subject match, return home
    return {
      routeTo: 'home',
      reason: `No matching subject found for "${subjectName}"`
    };
  } catch (error) {
    console.error('Error in subject routing:', error);
    return {
      routeTo: 'error',
      reason: 'Error routing to subject: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};
