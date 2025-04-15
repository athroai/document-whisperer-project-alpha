
import React from 'react';
import { AthroProfile } from '@/components/athro/AthroProfile';

export interface AthroProfileWrapperProps {
  name?: string;
  avatar?: string;
  subject?: string;
  [key: string]: any;
}

export const AthroProfileWrapper: React.FC<AthroProfileWrapperProps> = (props) => {
  // Filter out the showSuccessStatus prop
  const { showSuccessStatus, ...validProps } = props;
  
  // Pass only valid props to the original component
  return <AthroProfile {...validProps} />;
};
