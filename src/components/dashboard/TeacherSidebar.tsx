
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Bell, 
  FileCheck, 
  FileText, 
  UserCircle, 
  Mail, 
  BarChart3, 
  Settings,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-100 transition-colors",
        isActive && "bg-purple-100 text-purple-700 font-medium"
      )}
    >
      <Icon size={18} className={cn("text-gray-500", isActive && "text-purple-700")} />
      <span>{label}</span>
    </Link>
  );
};

interface TeacherSidebarProps {
  activePage: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ activePage }) => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/teacher-dashboard' },
    { icon: Users, label: 'My Sets', href: '/teacher/sets' },
    { icon: Bell, label: 'Notifications', href: '/teacher/notifications' },
    { icon: FileCheck, label: 'Marking Panel', href: '/teacher/marking' },
    { icon: FileText, label: 'Assign Work', href: '/teacher/assign' },
    { icon: UserCircle, label: 'Student Profiles', href: '/teacher/profiles' },
    { icon: Mail, label: 'Parent Inquiries', href: '/teacher/inquiries' },
    { icon: BarChart3, label: 'Insights', href: '/teacher/insights' },
    { icon: Settings, label: 'System Tools', href: '/teacher/system' },
  ];

  if (!user || user.role !== 'teacher') {
    setTimeout(() => navigate('/home'), 0);
    return null;
  }

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-purple-700">Teacher Dashboard</h2>
        <p className="text-sm text-gray-500">
          {user?.displayName || 'Teacher'}
        </p>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={item.href.includes(activePage)}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherSidebar;
