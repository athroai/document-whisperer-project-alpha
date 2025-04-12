
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WelcomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png"
              alt="Athro Logo"
              className="h-48 mx-auto"
            />
            <h1 className="mt-6 text-4xl font-bold text-purple-800 sm:text-5xl">
              Athro AI
            </h1>
            <p className="mt-3 text-xl text-gray-600">
              Welcome to Athro AI — your personalised GCSE study mentor. Let's get learning.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <Button 
              onClick={() => navigate('/signup')}
              className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowModal(true)}
              className="w-full py-6 text-lg border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500">
              Already have an account? {" "}
              <a 
                href="/login" 
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Log in here
              </a>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 Athro AI. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Learn More Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Meet Athro AI - Your Study Mentor</DialogTitle>
            <DialogDescription>
              Athro AI helps GCSE students with personalized, interactive study support across all subjects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            <div className="flex flex-col items-center text-center">
              <img 
                src="/lovable-uploads/a2640d0a-113f-4f37-9120-5533af965b5d.png" 
                alt="Athro AI Science" 
                className="w-24 h-24 object-cover rounded-full" 
              />
              <h3 className="mt-2 font-semibold text-lg">Athro AI Science</h3>
              <p className="text-sm text-gray-600">Your comprehensive science study companion</p>
            </div>
          
            <div className="flex flex-col items-center text-center">
              <img 
                src="/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png" 
                alt="AthroMaths" 
                className="w-24 h-24 object-cover rounded-full" 
              />
              <h3 className="mt-2 font-semibold text-lg">AthroMaths</h3>
              <p className="text-sm text-gray-600">Your friendly mathematics mentor</p>
            </div>
          
            <div className="flex flex-col items-center text-center">
              <img 
                src="/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png" 
                alt="AthroHistory" 
                className="w-24 h-24 object-cover rounded-full" 
              />
              <h3 className="mt-2 font-semibold text-lg">AthroHistory</h3>
              <p className="text-sm text-gray-600">Your knowledgeable history mentor</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <img 
                src="/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png" 
                alt="AthroLanguage" 
                className="w-24 h-24 object-cover rounded-full" 
              />
              <h3 className="mt-2 font-semibold text-lg">AthroLanguage</h3>
              <p className="text-sm text-gray-600">Your eloquent language teacher</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold text-purple-700">Key Features:</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Personalized study sessions based on your learning style</li>
              <li>• Interactive quizzes and revision materials</li>
              <li>• Past paper practice with step-by-step solutions</li>
              <li>• Study calendar to help you organize your revision</li>
              <li>• Track your progress across all subjects</li>
            </ul>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button onClick={() => {
              setShowModal(false);
              navigate('/signup');
            }}>
              Get Started Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WelcomePage;
