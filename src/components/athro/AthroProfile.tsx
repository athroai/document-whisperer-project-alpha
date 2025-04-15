
import React from 'react';

// Define a proper interface for the AthroProfile component
export interface AthroProfileProps {
  name?: string;
  avatar?: string;
  subject?: string;
  [key: string]: any;
}

export const AthroProfile: React.FC<AthroProfileProps> = (props) => {
  // This is a placeholder implementation
  // In a real app, this would render the Athro character profile
  return (
    <div className="athro-profile">
      <div className="avatar-container">
        {props.avatar ? (
          <img src={props.avatar} alt={props.name || 'Athro'} className="athro-avatar" />
        ) : (
          <div className="athro-avatar-placeholder">
            {props.name ? props.name.charAt(0) : 'A'}
          </div>
        )}
      </div>
      <div className="athro-info">
        <h3>{props.name || `Athro ${props.subject || ''}`}</h3>
        {props.subject && <p className="athro-subject">{props.subject}</p>}
      </div>
    </div>
  );
};

// Add a default export for backward compatibility
export default AthroProfile;
