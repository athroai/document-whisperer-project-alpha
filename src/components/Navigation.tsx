
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Upload, 
  MessageSquare, 
  Calendar, 
  User,
  LogOut, 
  Menu,
  X,
  Layers,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LoadingSpinner from './ui/loading-spinner';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const { user, loading } = state;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', path: '/home', icon: Home },
      { name: 'My Work', path: '/my-work', icon: Layers },
      { name: 'Uploads', path: '/files', icon: Upload },
      { name: 'AI Chat', path: '/athro/select', icon: MessageSquare },
      { name: 'Calendar', path: '/calendar', icon: Calendar },
      { name: 'Profile', path: '/settings', icon: User }
    ];

    // Additional items for teachers and admins
    if (user?.role === 'teacher' || user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/teacher', icon: Home },
        { name: 'Classes', path: '/teacher/sets', icon: BookOpen },
        { name: 'Marking', path: '/teacher/marking', icon: Layers },
        { name: 'Uploads', path: '/files', icon: Upload },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Settings', path: '/settings', icon: Settings }
      ];
    }
    
    return commonItems;
  };

  const navItems = getNavItems();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-purple-700">Athro AI</span>
          </Link>
          <LoadingSpinner size={20} />
        </div>
      </nav>
    );
  }

  // Don't show navigation for non-authenticated routes
  if (!user && location.pathname !== '/signup' && location.pathname !== '/') {
    navigate('/login');
    return null;
  }

  // Login/Signup navigation for unauthenticated users
  if (!user) {
    return (
      <nav className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-purple-700">Athro AI</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to={user.role === 'teacher' || user.role === 'admin' ? '/teacher' : '/home'} 
          className="flex items-center space-x-2"
        >
          <span className="text-xl font-bold text-purple-700">Athro AI</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                               location.pathname.startsWith(`${item.path}/`);
              
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
                    const isActive = location.pathname === item.path || 
                                     location.pathname.startsWith(`${item.path}/`);
                    
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
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-purple-200 text-purple-800">
                    {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-medium">{user.displayName}</div>
                <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-around items-center z-50">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                           location.pathname.startsWith(`${item.path}/`);
          
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
    </nav>
  );
};

export default Navigation;
