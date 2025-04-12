import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, GraduationCap, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  const subjects = [
    { name: 'Mathematics', mentor: 'AthroMaths', image: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png', progress: 65 },
    { name: 'Core Studies', mentor: 'Athro AI', image: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png', progress: 42 },
    { name: 'History', mentor: 'AthroHistory', image: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png', progress: 78 },
    { name: 'English', mentor: 'AthroEnglish', image: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png', progress: 54 },
  ];

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
              <h1 className="text-2xl font-bold">Welcome back, {user?.displayName || 'Student'}!</h1>
              <p className="mt-1 text-purple-100">Ready to continue your GCSE journey?</p>
              <div className="mt-4">
                <Button 
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => {}}
                >
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Your Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{subject.name}</CardTitle>
                        <CardDescription>with {subject.mentor}</CardDescription>
                      </div>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={subject.image} 
                          alt={subject.mentor} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{subject.progress}% complete</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link to="/study" className="w-full">
                      <Button variant="outline" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" /> Continue
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
      </div>
    </div>
  );
};

export default HomePage;
