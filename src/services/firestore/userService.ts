
import { 
  doc, getDoc, setDoc, updateDoc, 
  Timestamp, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { User } from "@/types/auth";

export class UserFirestoreService {
  /**
   * Creates or updates a user in Firestore
   */
  static async saveUser(user: User): Promise<void> {
    try {
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);

      // Create user document if it doesn't exist
      if (!userDoc.exists()) {
        const userData = {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          schoolId: user.schoolId || null,
          examBoard: user.examBoard || 'none',
          licenseExempt: user.licenseExempt || false,
          createdAt: serverTimestamp(),
        };
        
        await setDoc(userRef, userData);
        console.log("User created in Firestore:", user.id);
      } else {
        // Update existing user with new data (excluding createdAt)
        const userData = {
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          schoolId: user.schoolId || null,
          examBoard: user.examBoard || 'none',
          licenseExempt: user.licenseExempt || false,
          lastUpdated: serverTimestamp(),
        };
        
        await updateDoc(userRef, userData);
        console.log("User updated in Firestore:", user.id);
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  }

  /**
   * Retrieves a user from Firestore
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Convert Firestore timestamp to Date
        const createdAt = userData.createdAt instanceof Timestamp 
          ? userData.createdAt.toDate() 
          : new Date();
        
        return {
          id: userId,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          schoolId: userData.schoolId,
          examBoard: userData.examBoard,
          licenseExempt: userData.licenseExempt,
          createdAt: createdAt,
          rememberMe: true, // Default to true since this is from server
          confidenceScores: userData.confidenceScores || {
            maths: 5,
            science: 5,
            english: 5
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user from Firestore:", error);
      return null;
    }
  }

  /**
   * Updates a user's confidence score for a subject
   */
  static async updateConfidenceScore(
    userId: string, 
    subject: string, 
    score: number
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const confidenceScores = userData.confidenceScores || {};
        
        await updateDoc(userRef, {
          [`confidenceScores.${subject.toLowerCase()}`]: score,
          lastUpdated: serverTimestamp(),
        });
        
        console.log(`Updated confidence score for ${subject} to ${score}`);
      }
    } catch (error) {
      console.error("Error updating confidence score:", error);
      throw error;
    }
  }
}

export default UserFirestoreService;
