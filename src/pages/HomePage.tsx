
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAthro } from '@/contexts/AthroContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, User, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

// Import the SubjectCard for rich subject tiles
import { SubjectCard } from '@/components/home/SubjectCard';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { characters } = useAthro();
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch the user's chosen subjects from onboarding/preferences
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!state.user) return;
      setIsLoading(true);

      // Try to fetch from subject preferences (actual onboarding table may differ in real DB)
      const { data, error } = await supabase
        .from('student_subject_preferences')
        .select('subject')
        .eq('student_id', state.user.id);

      if (!error && data) {
        setUserSubjects(data.map((row: any) => row.subject));
      } else {
        setUserSubjects([]);
      }
      setIsLoading(false);
    };

    fetchSubjects();
  }, [state.user]);

  // If not logged in, show login/register option
  useEffect(() => {
    if (!state.isLoading && !state.user) {
      navigate('/login');
    }
  }, [state.isLoading, state.user, navigate]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Athro Dashboard</h1>
        <p className="text-gray-600 mt-2">Your chosen study mentors, progress, and sessions at a glance</p>
      </div>
      
      {/* Subject/Athro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500">Loading your subjects...</div>
        ) : userSubjects.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            You haven't selected any subjects yet. <br />
            <Button asChild variant="outline" className="mt-2">
              <Link to="/athro-onboarding">Select Subjects &gt;</Link>
            </Button>
          </div>
        ) : (
          userSubjects.map(subject => (
            <SubjectCard 
              key={subject}
              subject={subject}
              // Additional props such as confidence/progress can be piped in from student's DB data if available
            />
          ))
        )}
      </div>

      {/* Quick links (profile, calendar, settings) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              View your recent study activity and track your progress.
            </p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Start Studying
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">Begin a new study session with your Athro mentors.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link to="/athro">Meet Your Tutors</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Profile & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">Update your study preferences anytime.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <span className="h-5 w-5 mr-2 text-amber-500">&gt;</span>
            Customize Your Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4">
            Want to update your subjects or study schedule? You can always restart onboarding.
          </p>
          <Button asChild variant="outline" className="w-full border-amber-300 hover:bg-amber-50">
            <Link to="/athro-onboarding">Restart Onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
