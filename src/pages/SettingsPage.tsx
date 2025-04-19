
// On line 22, change examBoard initialization to handle type issues:
const [examBoard, setExamBoard] = useState<ExamBoard>(user?.examBoard as ExamBoard || 'AQA');
