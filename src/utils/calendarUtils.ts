
// Update getEventColor function to include a color property for border colors

export interface ColorStyle {
  bg: string;
  text: string;
  color: string; // Added for border colors
}

export const getEventColor = (subject: string): ColorStyle => {
  const normalizedSubject = subject.toLowerCase().trim();
  
  switch (normalizedSubject) {
    case 'mathematics':
    case 'maths':
    case 'math':
      return { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        color: '#9b87f5' // Added purple color for border
      };
      
    case 'english':
    case 'english literature':
    case 'english language':
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        color: '#10b981' // Added green color for border
      };
      
    case 'science':
    case 'biology':
      return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        color: '#0ea5e9' // Added blue color for border
      };
      
    case 'chemistry':
      return { 
        bg: 'bg-teal-100', 
        text: 'text-teal-800',
        color: '#14b8a6' // Added teal color for border
      };
      
    case 'physics':
      return { 
        bg: 'bg-cyan-100', 
        text: 'text-cyan-800',
        color: '#06b6d4' // Added cyan color for border
      };
      
    case 'history':
      return { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        color: '#f59e0b' // Added amber color for border
      };
      
    case 'geography':
      return { 
        bg: 'bg-lime-100', 
        text: 'text-lime-800',
        color: '#84cc16' // Added lime color for border
      };
      
    case 'religious studies':
    case 'religious education':
    case 're':
      return { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-800',
        color: '#6366f1' // Added indigo color for border
      };
      
    case 'art':
    case 'art & design':
      return { 
        bg: 'bg-pink-100', 
        text: 'text-pink-800',
        color: '#ec4899' // Added pink color for border
      };
      
    case 'music':
      return { 
        bg: 'bg-violet-100', 
        text: 'text-violet-800',
        color: '#8b5cf6' // Added violet color for border
      };
      
    case 'drama':
    case 'theatre':
      return { 
        bg: 'bg-fuchsia-100', 
        text: 'text-fuchsia-800',
        color: '#d946ef' // Added fuchsia color for border
      };
      
    case 'physical education':
    case 'pe':
    case 'sports':
      return { 
        bg: 'bg-red-100', 
        text: 'text-red-800',
        color: '#ef4444' // Added red color for border
      };
      
    case 'computer science':
    case 'computing':
    case 'ict':
      return { 
        bg: 'bg-sky-100', 
        text: 'text-sky-800',
        color: '#0284c7' // Added sky color for border
      };
      
    case 'business studies':
    case 'business':
    case 'economics':
      return { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800',
        color: '#f97316' // Added orange color for border
      };
    
    default:
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800',
        color: '#8E9196' // Added gray color for border
      };
  }
};
