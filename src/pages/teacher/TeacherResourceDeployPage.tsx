import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Check, Link as LinkIcon, FileUp, Wand2 } from 'lucide-react';
import ResourceUpload from '@/components/dashboard/ResourceUpload';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Class, StudentDetail } from '@/types/teacher';
import { UploadMetadata } from '@/types/files';

// Mock data for Sets (classes)
const mockClasses: Class[] = [
  { id: 'class1', name: '9A Maths', teacher_id: 'teacher1', school_id: 'school1', subject: 'Mathematics', student_ids: ['student1', 'student2', 'student3'] },
  { id: 'class2', name: '10B Science', teacher_id: 'teacher1', school_id: 'school1', subject: 'Science', student_ids: ['student4', 'student5', 'student6'] },
  { id: 'class3', name: '11C English', teacher_id: 'teacher1', school_id: 'school1', subject: 'English', student_ids: ['student7', 'student8', 'student9'] },
];

// Mock data for students
const mockStudents: StudentDetail[] = [
  { id: 'student1', name: 'Alex Smith', email: 'alex@example.com', status: 'approved', parentInquiry: false, performance: 85, lastActive: '2023-04-10T14:30:00Z', classId: 'class1' },
  { id: 'student2', name: 'Emma Jones', email: 'emma@example.com', status: 'approved', parentInquiry: true, performance: 92, lastActive: '2023-04-11T10:15:00Z', classId: 'class1' },
  { id: 'student3', name: 'Michael Brown', email: 'michael@example.com', status: 'approved', parentInquiry: false, performance: 78, lastActive: '2023-04-09T09:45:00Z', classId: 'class1' },
  { id: 'student4', name: 'Sophia White', email: 'sophia@example.com', status: 'approved', parentInquiry: false, performance: 88, lastActive: '2023-04-12T16:20:00Z', classId: 'class2' },
];

interface DeploymentStep {
  title: string;
  description: string;
}

const steps: DeploymentStep[] = [
  { 
    title: "Select Audience", 
    description: "Choose which students or sets will receive this resource"
  },
  { 
    title: "Choose Resource", 
    description: "Select or upload the resource you want to share"
  },
  { 
    title: "Deploy", 
    description: "Review and deploy your resource"
  }
];

const TeacherResourceDeployPage = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assignToWholeClass, setAssignToWholeClass] = useState<boolean>(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState<string>('upload');
  const [resourceUrl, setResourceUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [aiInstruction, setAiInstruction] = useState<string>('');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [topic, setTopic] = useState<string>('');
  
  // Get students for the selected class
  const classStudents = mockStudents.filter(student => student.classId === selectedClassId);
  
  // Step handlers
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle student selection
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle resource upload completion with the new UploadMetadata type
  const handleUploadComplete = (metadata: UploadMetadata) => {
    setResourceUrl(metadata.url);
    setFileName(metadata.filename);
    
    toast({
      title: "File uploaded",
      description: "Your resource has been uploaded successfully.",
    });
  };

  // Handle deployment submission
  const handleDeploy = () => {
    // Prepare data for submission
    const deploymentData = {
      teacherId: 'teacher1', // Would come from auth context in production
      classId: selectedClassId,
      studentIds: assignToWholeClass ? undefined : selectedStudentIds,
      resourceType: resourceType === 'upload' ? 'file' : resourceType === 'link' ? 'link' : 'ai-instruction',
      fileUrl: resourceUrl,
      fileName: fileName,
      linkUrl: linkUrl,
      aiInstruction: aiInstruction,
      deployedAt: new Date().toISOString(),
      subject,
      topic
    };

    // In a real app, this would be a service call
    console.log('Deploying resource:', deploymentData);
    
    // Show success message
    toast({
      title: "Resource Deployed!",
      description: "Your resource has been assigned to the selected students.",
    });
    
    // Reset form
    setCurrentStep(0);
    setSelectedClassId('');
    setAssignToWholeClass(true);
    setSelectedStudentIds([]);
    setResourceType('upload');
    setResourceUrl('');
    setFileName('');
    setLinkUrl('');
    setAiInstruction('');
    setTopic('');
  };

  // Validation for each step
  const canProceedStep1 = selectedClassId && (assignToWholeClass || selectedStudentIds.length > 0);
  const canProceedStep2 = 
    (resourceType === 'upload' && resourceUrl) || 
    (resourceType === 'link' && linkUrl) || 
    (resourceType === 'ai-instruction' && aiInstruction);
  
  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Deployment Panel</h1>
          <p className="text-gray-500">Assign resources to your students or entire sets</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex-1 relative ${index > 0 ? "ml-2" : ""}`}
            >
              <div className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                    ${currentStep === index 
                      ? "bg-purple-100 border-purple-500 text-purple-700" 
                      : currentStep > index 
                        ? "bg-green-100 border-green-500 text-green-700" 
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                >
                  {currentStep > index ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div 
                  className={`flex-1 h-1 ${
                    index < steps.length - 1 
                      ? currentStep > index 
                        ? "bg-green-500" 
                        : "bg-gray-300"
                      : "bg-transparent"
                  }`}
                />
              </div>
              <div className="mt-2">
                <p className={`text-sm font-medium ${
                  currentStep === index 
                    ? "text-purple-700" 
                    : currentStep > index 
                      ? "text-green-700" 
                      : "text-gray-500"
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Select Audience */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="class-select">Select a Set</Label>
                  <Select 
                    value={selectedClassId} 
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger id="class-select" className="w-full">
                      <SelectValue placeholder="Select a set" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedClassId && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="whole-class" 
                        checked={assignToWholeClass}
                        onCheckedChange={(checked) => {
                          setAssignToWholeClass(checked === true);
                          if (checked) {
                            setSelectedStudentIds([]);
                          }
                        }}
                      />
                      <Label htmlFor="whole-class">Assign to whole set</Label>
                    </div>
                    
                    {!assignToWholeClass && (
                      <div className="space-y-2">
                        <Label>Select Students</Label>
                        <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                          {classStudents.map(student => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`student-${student.id}`}
                                checked={selectedStudentIds.includes(student.id)}
                                onCheckedChange={() => handleStudentToggle(student.id)}
                              />
                              <Label htmlFor={`student-${student.id}`}>{student.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 2: Choose Resource */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Tabs defaultValue="upload" onValueChange={setResourceType} value={resourceType}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload" className="flex items-center gap-1">
                      <FileUp className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </TabsTrigger>
                    <TabsTrigger value="ai-instruction" className="flex items-center gap-1">
                      <Wand2 className="h-4 w-4" />
                      AI Instruction
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4 pt-4">
                    <ResourceUpload 
                      subjectId={subject}
                      classId={selectedClassId}
                      onUploadComplete={handleUploadComplete}
                    />
                    {resourceUrl && (
                      <p className="text-sm text-green-600">
                        ✓ File uploaded successfully: {fileName}
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="link" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="link-url">Resource URL</Label>
                      <Input 
                        id="link-url" 
                        placeholder="https://example.com/resource"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai-instruction" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-prompt">
                        AI Instruction
                      </Label>
                      <Textarea 
                        id="ai-prompt"
                        placeholder="Write a prompt for the AI to process this resource (e.g., 'Summarize this article in bullet points')"
                        className="min-h-[120px]"
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic (optional)</Label>
                    <Input 
                      id="topic" 
                      placeholder="e.g., Algebra, Ecosystems, etc."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Deploy */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-medium text-lg">Deployment Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Selected Set:</p>
                      <p className="font-medium">
                        {mockClasses.find(c => c.id === selectedClassId)?.name || 'None selected'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Audience:</p>
                      <p className="font-medium">
                        {assignToWholeClass 
                          ? 'Entire Set' 
                          : `${selectedStudentIds.length} Selected Students`}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Resource Type:</p>
                      <p className="font-medium">
                        {resourceType === 'upload' 
                          ? `Uploaded File: ${fileName}`
                          : resourceType === 'link'
                            ? 'External Link'
                            : 'AI Instruction'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Subject:</p>
                      <p className="font-medium">{subject}</p>
                    </div>
                    
                    {topic && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Topic:</p>
                        <p className="font-medium">{topic}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <p className="text-amber-700 text-sm">
                    Students will be notified about this new resource in their dashboard.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-6 border-t flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNextStep}
                disabled={currentStep === 0 && !canProceedStep1 || currentStep === 1 && !canProceedStep2}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleDeploy}>
                Deploy Resource
              </Button>
            )}
          </div>
        </Card>
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherResourceDeployPage;
