import React from 'react';
import { AthroProfileWrapper } from './AthroProfileWrapper';

// This is a placeholder file to demonstrate the usage of AthroProfileWrapper
// In your actual application, you would need to find where AthroProfile is used with showSuccessStatus
// and replace it with AthroProfileWrapper

export const AthroProfileUsageExample = () => {
  return (
    <div>
      {/* Example - replace any instance of AthroProfile that uses showSuccessStatus */}
      <AthroProfileWrapper
        // Other props remain the same
        // showSuccessStatus is removed automatically
      />
    </div>
  );
};
