// Assuming this is just a fictional representation of the part that needs fixing
// Find the function that returns resources and update its return type
export const getResourcesForSubject = (subject: string): string[] => {
  const resources = [
    { id: '1', name: 'Sample Resource 1', type: 'pdf' },
    { id: '2', name: 'Sample Resource 2', type: 'pdf' },
    { id: '3', name: 'Sample Resource 3', type: 'pdf' }
  ];
  
  // Return just the IDs as strings to match expected string[] return type
  return resources.map(resource => resource.id);
};
