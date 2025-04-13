
export interface StudentClassLink {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  teacherId: string;
  yearGroup: string;
  joinedAt: string;
  active: boolean;
}

export interface EnrolledSubject {
  subject: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  className: string;
  yearGroup: string;
}
