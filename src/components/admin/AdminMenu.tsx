
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, BookOpen, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMenuItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

const AdminMenuItem = ({ icon: Icon, label, href, isActive }: AdminMenuItemProps) => {
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

const AdminMenu: React.FC = () => {
  const location = useLocation();
  
  const adminItems = [
    { icon: BookOpen, label: 'Knowledge Base', href: '/admin/knowledge-base' },
    { icon: Database, label: 'Data Management', href: '/admin/data-management' },
    { icon: Shield, label: 'Access Control', href: '/admin/access-control' },
    { icon: Settings, label: 'System Settings', href: '/admin/settings' },
  ];
  
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-purple-700">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">
          System Administration
        </p>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1">
        {adminItems.map((item) => (
          <AdminMenuItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={location.pathname === item.href}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500">Admin Mode Active</span>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
