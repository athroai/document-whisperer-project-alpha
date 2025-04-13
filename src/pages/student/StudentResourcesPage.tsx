
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Link as LinkIcon, Download, Wand2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock assigned resources
const mockResources = [
  {
    id: 'resource1',
    teacherName: 'Mr. Johnson',
    resourceType: 'file',
    title: 'Quadratic Equations Worksheet',
    fileUrl: 'https://example.com/files/quadratic-worksheet.pdf',
    subject: 'Mathematics',
    topic: 'Algebra',
    assignedDate: '2023-04-10T14:30:00Z',
    completed: false
  },
  {
    id: 'resource2',
    teacherName: 'Ms. Smith',
    resourceType: 'link',
    title: 'Khan Academy: Chemical Bonding',
    linkUrl: 'https://www.khanacademy.org/science/chemistry/chemical-bonds',
    subject: 'Science',
    topic: 'Chemistry',
    assignedDate: '2023-04-09T10:15:00Z',
    completed: true
  },
  {
    id: 'resource3',
    teacherName: 'Mr. Johnson',
    resourceType: 'ai-instruction',
    title: 'Practice Essay Analysis',
    aiInstruction: 'Identify the key themes in this essay and suggest improvements for the conclusion.',
    fileUrl: 'https://example.com/files/sample-essay.pdf',
    subject: 'English',
    topic: 'Essay Writing',
    assignedDate: '2023-04-11T09:45:00Z',
    completed: false
  }
];

const StudentResourcesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleMarkComplete = (resourceId: string) => {
    toast({
      title: "Resource Marked as Complete",
      description: "Your teacher has been notified of your progress.",
    });
    console.log(`Marking resource ${resourceId} as complete`);
  };
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      case 'ai-instruction':
        return <Wand2 className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Resources</h1>
        <p className="text-gray-500">Resources assigned to you by your teachers</p>
      </div>
      
      {mockResources.length > 0 ? (
        <div className="space-y-4">
          {mockResources.map(resource => (
            <Card key={resource.id} className={resource.completed ? "opacity-75" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.resourceType)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    <CardDescription>
                      Assigned by {resource.teacherName} on {new Date(resource.assignedDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={resource.completed ? "outline" : "default"}>
                    {resource.completed ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    ) : "To Complete"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Subject:</span> {resource.subject}
                  </div>
                  {resource.topic && (
                    <div>
                      <span className="text-gray-500">Topic:</span> {resource.topic}
                    </div>
                  )}
                </div>
                
                {resource.resourceType === 'ai-instruction' && (
                  <div className="bg-purple-50 p-3 rounded-md mt-2 text-sm">
                    <p className="font-medium mb-1">AI Instruction:</p>
                    <p>{resource.aiInstruction}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" className="gap-2">
                  {resource.resourceType === 'link' ? (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      Open Link
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
                
                {!resource.completed && (
                  <Button onClick={() => handleMarkComplete(resource.id)}>
                    Mark as Complete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No resources have been assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentResourcesPage;
