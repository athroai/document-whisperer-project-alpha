import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state, logout } = useAuth();
  const { user } = state;

  // Base nav items for students
  const studentNavItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Study', path: '/study', icon: BookOpen },
    { name: 'Assignments', path: '/assignments', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Quiz', path: '/quiz', icon: GraduationCap },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Nav items for teachers and admins
  const teacherNavItems = [
    { name: 'Dashboard', path: '/teacher', icon: Presentation }
  ];

  // Select the appropriate nav items based on user role
  const navItems = user?.role === 'teacher' || user?.role === 'admin' 
    ? teacherNavItems 
    : studentNavItems;

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? (user.role === 'teacher' || user.role === 'admin' ? '/teacher' : '/athro/select') : '/'} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-purple-700">Athro AI</span>
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback className="bg-purple-200 text-purple-800">
                  {user.displayName?.[0].toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={handleLogout}
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
      
      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-around items-center z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  isActive
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
    </nav>
  );
};

export default Navigation;
