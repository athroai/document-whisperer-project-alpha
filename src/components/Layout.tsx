
import React from 'react';
import { Navbar } from './ui/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default Layout;
