
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20'
  };
  
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png"
        alt="Athro AI"
        className={`${sizeClasses[size]}`}
      />
      {withText && (
        <span className={`font-bold text-purple-700 ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'} ml-2`}>
          Athro AI
        </span>
      )}
    </Link>
  );
};

export default Logo;
