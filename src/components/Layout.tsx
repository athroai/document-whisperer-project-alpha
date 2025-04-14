
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
};

export default Layout;
