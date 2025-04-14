
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  BookOpen,
  LayoutDashboard,
  Calendar,
  Upload,
  MessageSquare,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from './button';

export interface NavbarItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavbarItem[] = [
  {
    name: 'Home',
    path: '/home',
    icon: Home
  },
  {
    name: 'Select Subject',
    path: '/athro/select',
    icon: BookOpen
  },
  {
    name: 'Dashboard',
    path: '/teacher',
    icon: LayoutDashboard
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: Calendar
  },
  {
    name: 'Uploads',
    path: '/files',
    icon: Upload
  },
  {
    name: 'Chat',
    path: '/athro',
    icon: MessageSquare
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings
  }
];

export function Navbar() {
  const location = useLocation();
  const { athroThemeForSubject, currentSubject } = useAthro();
  
  // Get theme colors based on current subject
  const theme = currentSubject 
    ? athroThemeForSubject(currentSubject)
    : { primaryHex: '#8B5CF6', secondaryHex: '#D946EF' }; // Default purple theme
  
  return (
    <nav className="bg-white shadow-md py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/home" className="flex items-center">
            <span className="text-xl font-bold text-purple-600">Athro AI</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/home' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
