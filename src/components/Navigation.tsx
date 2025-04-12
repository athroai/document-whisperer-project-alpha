
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Users, 
  Presentation,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state, logout } = useAuth();
  const { user } = state;

  // Base nav items for all users
  const baseNavItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Study', path: '/study', icon: BookOpen },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Quiz', path: '/quiz', icon: GraduationCap },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Add teacher dashboard for teacher role
  const navItems = user?.role === 'teacher' 
    ? [...baseNavItems, { name: 'Teacher Dashboard', path: '/teacher-dashboard', icon: Presentation }] 
    : baseNavItems;

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user?.role === 'teacher' ? '/teacher-dashboard' : '/'} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-purple-700">Athro AI</span>
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-4">
              {user.role !== 'teacher' ? (
                // Student navigation
                navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                        location.pathname === item.path
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              ) : (
                // Teacher only shows the dashboard link
                <Link 
                  to="/teacher-dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                    location.pathname === '/teacher-dashboard'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <Presentation size={18} />
                  <span>Teacher Dashboard</span>
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-200 text-purple-800">
                  {user.displayName?.[0].toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={() => logout()}
              >
                <LogOut size={18} className="mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile Navigation - Only show for students */}
      {user && user.role !== 'teacher' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  location.pathname === item.path
                    ? 'text-purple-700'
                    : 'text-gray-500 hover:text-purple-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
      
      {/* Mobile Navigation - Simple version for teachers */}
      {user && user.role === 'teacher' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-center items-center">
          <Link
            to="/teacher-dashboard"
            className={`flex flex-col items-center p-2 ${
              location.pathname.includes('/teacher')
                ? 'text-purple-700'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Presentation size={20} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
