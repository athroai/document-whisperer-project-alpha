
// Since we can't directly edit this file (it's in read-only files),
// but we can see there's an error related to showSuccessStatus prop,
// we need to update any component that's using AthroProfile with this prop.

// Let's create a wrapper component that doesn't use the unsupported prop:

import React from 'react';
import AthroProfile from '@/components/athro/AthroProfile';

export const AthroProfileWrapper: React.FC<any> = (props) => {
  // Filter out the showSuccessStatus prop
  const { showSuccessStatus, ...validProps } = props;
  
  // Pass only valid props to the original component
  return <AthroProfile {...validProps} />;
};
