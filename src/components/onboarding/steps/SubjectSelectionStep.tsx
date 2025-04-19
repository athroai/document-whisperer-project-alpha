
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { useSubjects } from '@/hooks/useSubjects';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronLeft, ChevronRight, Star, StarHalf, StarOff } from 'lucide-react';
import { ConfidenceLabel, confidenceOptions } from '@/types/confidence';
import { motion } from 'framer-motion';

export const SubjectSelectionStep: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading } = useSubjects();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredSubjects = subjects.filter(subject => 
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const getSelectedConfidence = (subject: string): ConfidenceLabel => {
    return selectedSubjects.find(s => s.subject === subject)?.confidence || 'Neutral';
  };

  const handleSubjectToggle = (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
    } else {
      selectSubject(subject, 'Neutral');
    }
  };

  const handleConfidenceChange = (subject: string, confidence: ConfidenceLabel) => {
    selectSubject(subject, confidence);
  };

  const handleBack = () => {
    updateOnboardingStep('welcome');
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('schedule');
    }
  };

  const getConfidenceIcon = (confidence: ConfidenceLabel) => {
    switch (confidence) {
      case 'Very Low':
      case 'Low':
        return <StarOff className="h-5 w-5" />;
      case 'Neutral':
        return <StarHalf className="h-5 w-5" />;
      case 'High':
      case 'Very High':
        return <Star className="h-5 w-5 fill-current" />;
      default:
        return <StarHalf className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading subjects...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Select Your Subjects</h2>
        <p className="text-muted-foreground">Choose the subjects you're studying and rate your confidence level</p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search subjects..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          const confidence = getSelectedConfidence(subject);
          
          return (
            <motion.div 
              key={subject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`p-4 cursor-pointer transition-all ${
                isSelected ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-200'
              }`} onClick={() => handleSubjectToggle(subject)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100'
                    }`}>
                      {isSelected ? <Check className="h-5 w-5" /> : null}
                    </div>
                    <span className="ml-3 font-medium">{subject}</span>
                  </div>
                  
                  {isSelected && (
                    <Badge 
                      variant="outline" 
                      className={getConfidenceColor(confidence)}
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = confidenceOptions.indexOf(confidence);
                        const nextIndex = (currentIndex + 1) % confidenceOptions.length;
                        handleConfidenceChange(subject, confidenceOptions[nextIndex]);
                      }}
                    >
                      {getConfidenceIcon(confidence)}
                      <span className="ml-1">{confidence}</span>
                    </Badge>
                  )}
                </div>
                
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Set your confidence level:</p>
                    <div className="flex flex-wrap gap-2">
                      {confidenceOptions.map((option) => (
                        <Badge 
                          key={option}
                          variant={confidence === option ? "default" : "outline"}
                          className={`cursor-pointer ${confidence === option ? getConfidenceColor(option) : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfidenceChange(subject, option);
                          }}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${selectedSubjects.length > 0 ? 'text-green-600' : 'text-amber-500'}`}>
            {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} selected
          </span>
          <Button
            onClick={handleContinue}
            disabled={selectedSubjects.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get confidence level color
function getConfidenceColor(confidence: ConfidenceLabel): string {
  switch (confidence) {
    case 'Very Low':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Low':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Neutral':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'High':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Very High':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return '';
  }
}
