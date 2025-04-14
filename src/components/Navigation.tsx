
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Presentation,
  BarChart,
  Clock,
  History,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state, logout } = useAuth();
  const { user } = state;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Base nav items for students
  const studentNavItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Study', path: '/athro/select', icon: BookOpen },
    { name: 'Quiz', path: '/quiz', icon: GraduationCap },
    { name: 'Progress', path: '/student/progress', icon: BarChart },
    { name: 'History', path: '/student/history', icon: History },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Nav items for teachers and admins
  const teacherNavItems = [
    { name: 'Dashboard', path: '/teacher', icon: Presentation },
    { name: 'Students', path: '/teacher/profiles', icon: GraduationCap },
    { name: 'Assignments', path: '/teacher/assign', icon: BookOpen },
    { name: 'Marking', path: '/teacher/marking', icon: BookOpen },
    { name: 'Analytics', path: '/teacher/analytics', icon: BarChart }
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

  if (!user) {
    return null; // Don't show navigation if user is not logged in
  }

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? (user.role === 'teacher' || user.role === 'admin' ? '/teacher' : '/athro/select') : '/'} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-purple-700">Athro AI</span>
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                
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
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Menu</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="py-4">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center px-4 py-3 ${
                            isActive
                              ? 'bg-purple-50 text-purple-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon size={18} className="mr-3" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    <div className="border-t mt-4 pt-4 px-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback className="bg-purple-200 text-purple-800">
                  {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="text-gray-600 hidden md:flex"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-1" />
                <span>Logout</span>
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
      
      {/* Bottom Navigation for Mobile */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-around items-center z-50">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            
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
