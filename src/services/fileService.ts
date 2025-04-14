
import { db, storage } from '@/config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

export interface UploadedFile {
  id?: string;
  userId: string;
  filename: string;
  fileType: 'paper' | 'notes' | 'quiz';
  fileURL: string;
  originalName: string;
  subject?: string;
  description?: string;
  size?: number;
  createdAt?: Date;
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const fileService = {
  // Upload a file to Firebase Storage
  uploadFile: async (
    file: File, 
    userId: string, 
    metadata: { 
      fileType: 'paper' | 'notes' | 'quiz';
      subject?: string;
      description?: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> => {
    try {
      if (!file) throw new Error('No file provided');
      
      // Create a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${userId}_${timestamp}.${fileExtension}`;
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `uploads/${userId}/${uniqueFilename}`);
      
      // Start upload
      onProgress?.({ progress: 0, status: 'uploading' });
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({ progress, status: 'uploading' });
          },
          (error) => {
            onProgress?.({ progress: 0, status: 'error', error: error.message });
            reject(error);
          },
          async () => {
            try {
              // Upload completed successfully, get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Save file metadata to Firestore
              const fileData: Omit<UploadedFile, 'id'> = {
                userId,
                filename: uniqueFilename,
                fileURL: downloadURL,
                originalName: file.name,
                fileType: metadata.fileType,
                subject: metadata.subject,
                description: metadata.description,
                size: file.size,
                createdAt: new Date()
              };
              
              const docRef = await addDoc(collection(db, 'uploads'), {
                ...fileData,
                createdAt: serverTimestamp()
              });
              
              onProgress?.({ progress: 100, status: 'success' });
              
              resolve({
                id: docRef.id,
                ...fileData
              });
            } catch (error) {
              console.error('Error saving file metadata:', error);
              onProgress?.({ 
                progress: 100, 
                status: 'error', 
                error: 'Upload succeeded but failed to save metadata' 
              });
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      onProgress?.({ 
        progress: 0, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },

  // Get all files for a user
  getUserFiles: async (userId: string): Promise<UploadedFile[]> => {
    try {
      const filesRef = collection(db, 'uploads');
      const q = query(
        filesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const files: UploadedFile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        files.push({
          id: doc.id,
          userId: data.userId,
          filename: data.filename,
          fileType: data.fileType,
          fileURL: data.fileURL,
          originalName: data.originalName,
          subject: data.subject,
          description: data.description,
          size: data.size,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      return files;
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (file: UploadedFile): Promise<void> => {
    try {
      if (!file.id) throw new Error('File ID not provided');
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'uploads', file.id));
      
      // Delete from Storage
      const storageRef = ref(storage, `uploads/${file.userId}/${file.filename}`);
      await deleteObject(storageRef);
      
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Get files for a specific subject
  getFilesBySubject: async (userId: string, subject: string): Promise<UploadedFile[]> => {
    try {
      const filesRef = collection(db, 'uploads');
      const q = query(
        filesRef, 
        where('userId', '==', userId),
        where('subject', '==', subject),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const files: UploadedFile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        files.push({
          id: doc.id,
          userId: data.userId,
          filename: data.filename,
          fileType: data.fileType,
          fileURL: data.fileURL,
          originalName: data.originalName,
          subject: data.subject,
          description: data.description,
          size: data.size,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      return files;
    } catch (error) {
      console.error('Error getting files by subject:', error);
      throw error;
    }
  }
};

export default fileService;
