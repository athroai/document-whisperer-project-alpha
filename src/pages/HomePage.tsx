import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, GraduationCap, Clock, Gauge, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useAthro } from '@/contexts/AthroContext';
import { SubjectCard } from '@/components/home/SubjectCard';
import { useSubjects } from '@/hooks/useSubjects';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  const { characters } = useAthro();
  const { subjects, isLoading, error } = useSubjects();
  const [isConfidenceModalOpen, setIsConfidenceModalOpen] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(5);
  const [currentAthro, setCurrentAthro] = useState({
    name: 'AthroMaths',
    subject: 'Mathematics',
    image: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
  });

  const subjectCharacters = characters.filter(char => 
    !['AthroAI', 'Timekeeper', 'System'].includes(char.subject)
  );
  
  const systemCharacters = characters.filter(char => 
    ['AthroAI', 'Timekeeper', 'System'].includes(char.subject)
  );
  
  const subjectProgress = {
    'Mathematics': 65,
    'Science': 42,
    'History': 78,
    'English': 54,
    'Welsh': 30,
    'Geography': 45,
    'Languages': 60,
    'Religious Education': 51
  };

  const confidenceScores = user?.confidenceScores || {};
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleConfidenceSubmit = () => {
    console.log(`User confidence score: ${confidenceScore} for ${currentAthro.subject}`);
    toast.success(`Your confidence score of ${confidenceScore}/10 has been recorded!`);
    setIsConfidenceModalOpen(false);
  };

  const upcomingEvents = [
    { id: 1, title: 'Math Quiz Review', date: 'Today, 4:00 PM', mentor: 'AthroMaths' },
    { id: 2, title: 'Science Past Paper', date: 'Tomorrow, 11:00 AM', mentor: 'AthroScience' },
    { id: 3, title: 'History Essay Planning', date: 'Wed, 2:00 PM', mentor: 'AthroHistory' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img
                src="/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png"
                alt="Athro Mentor"
                className="w-24 h-24 object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getGreeting()}, {user?.displayName || 'Student'}!</h1>
              <p className="mt-1 text-purple-100">Ready to continue your GCSE journey?</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button 
            onClick={() => navigate('/study')}
            className="p-8 h-auto text-xl flex flex-col items-center bg-purple-600 hover:bg-purple-700"
          >
            <BookOpen className="h-12 w-12 mb-2" />
            <span>Start Study Session</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/calendar')}
            className="p-8 h-auto text-xl flex flex-col items-center bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="h-12 w-12 mb-2" />
            <span>View Calendar</span>
          </Button>
          
          <Button 
            onClick={() => setIsConfidenceModalOpen(true)}
            className="p-8 h-auto text-xl flex flex-col items-center bg-amber-500 hover:bg-amber-600"
          >
            <Gauge className="h-12 w-12 mb-2" />
            <span>Check Confidence</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Your Subjects</h2>
            
            {isLoading ? (
              <p className="text-gray-500">Loading your subjects...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">Failed to load subjects. Please try again later.</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No subjects selected yet</h3>
                <p className="text-yellow-600 mb-4">You haven't selected any subjects to study yet.</p>
                <Link to="/onboarding">
                  <Button>
                    Complete Onboarding
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((subject) => (
                  <SubjectCard 
                    key={subject}
                    subject={subject}
                    confidence={confidenceScores[subject.toLowerCase()] || 5}
                    progress={subjectProgress[subject] || Math.floor(Math.random() * 80) + 10}
                  />
                ))}
              </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-800">System Helpers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {systemCharacters.map((character) => (
                <Card key={character.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{character.name}</CardTitle>
                        <CardDescription className="text-xs">{character.shortDescription}</CardDescription>
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={character.avatarUrl} 
                          alt={character.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Link to={`/study?subject=${character.subject.toLowerCase()}`} className="w-full">
                      <Button variant="outline" className="w-full text-sm">
                        <Brain className="h-5 w-5 mr-2" />
                        <span>Open {character.name}</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Completed Math Quiz</p>
                        <p className="text-sm text-gray-500">Score: 85% | Yesterday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Science Study Session</p>
                        <p className="text-sm text-gray-500">45 minutes | 2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">History Practice Test</p>
                        <p className="text-sm text-gray-500">Score: 78% | 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" /> 
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                        <p className="text-xs text-purple-600">with {event.mentor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/calendar" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Calendar
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/study">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Study Session
                  </Button>
                </Link>
                <Link to="/quiz">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Take a Quiz
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Plan Your Week
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-amber-900">Study Streak</h3>
                    <p className="text-amber-800">4 days in a row!</p>
                  </div>
                  <div className="bg-amber-200 rounded-full p-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 10L20 15L15 20" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 4V11C4 12.0609 4.42143 13.0783 5.17157 13.8284C5.92172 14.5786 6.93913 15 8 15H20" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                        i < 4 ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-400'
                      }`}
                    >
                      {i < 4 ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="rounded-full p-2 h-16 w-16 shadow-lg bg-white hover:bg-gray-100">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={currentAthro.image} alt={currentAthro.name} />
                  <AvatarFallback>{currentAthro.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <div className="space-y-2">
                <h3 className="font-medium">Change your Athro</h3>
                <p className="text-sm text-gray-500">Select your subject mentor:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {subjectCharacters.slice(0, 6).map((character) => (
                    <Button 
                      key={character.id}
                      variant="outline" 
                      className="flex flex-col h-auto p-2 items-center justify-center"
                      onClick={() => {
                        setCurrentAthro({
                          name: character.name,
                          subject: character.subject,
                          image: character.avatarUrl
                        });
                        toast.success(`${character.name} is now your active mentor!`);
                      }}
                    >
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarImage src={character.avatarUrl} />
                        <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{character.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Dialog open={isConfidenceModalOpen} onOpenChange={setIsConfidenceModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Confidence Check-In</DialogTitle>
            <DialogDescription className="text-center">
              On a scale of 1 to 10, how confident do you feel in {currentAthro.subject} today?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-purple-600">{confidenceScore}</span>
              <span className="text-xl font-medium text-gray-500">/10</span>
            </div>
            <Slider
              value={[confidenceScore]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setConfidenceScore(value[0])}
              className="mb-6"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfidenceSubmit} className="w-full">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
