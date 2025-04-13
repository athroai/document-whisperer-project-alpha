
import { 
  doc, getDoc, setDoc, updateDoc, arrayUnion, 
  Timestamp, serverTimestamp, collection, query, where, getDocs,
  limit, orderBy 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { AthroMessage } from "@/types/athro";

interface AthroSessionMessage {
  role: 'user' | 'athro';
  content: string;
  timestamp: Timestamp;
}

interface AthroSession {
  userId: string;
  subject: string;
  messages: AthroSessionMessage[];
  lastTopic?: string;
  lastUsed: Timestamp;
}

const MAX_MESSAGES_STORED = 20;
const SESSION_COLLECTION = "athro_sessions";

export class AthroSessionFirestoreService {
  /**
   * Gets the session document ID for a user and subject
   */
  private static getSessionId(userId: string, subject: string): string {
    return `${userId}_${subject.toLowerCase()}`;
  }
  
  /**
   * Creates or updates an Athro session in Firestore
   */
  static async saveSession(
    userId: string, 
    subject: string, 
    messages: AthroMessage[],
    lastTopic?: string
  ): Promise<void> {
    try {
      if (!userId || !subject) {
        throw new Error("User ID and subject are required");
      }
      
      const sessionId = this.getSessionId(userId, subject);
      const sessionRef = doc(db, SESSION_COLLECTION, sessionId);
      
      // Get only the latest messages (max 20)
      const latestMessages: AthroSessionMessage[] = messages
        .slice(-MAX_MESSAGES_STORED)
        .map(msg => ({
          role: msg.senderId === 'user' ? 'user' : 'athro',
          content: msg.content,
          timestamp: Timestamp.fromDate(new Date(msg.timestamp))
        }));
      
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        // Create new session document
        const sessionData: AthroSession = {
          userId,
          subject,
          messages: latestMessages,
          lastTopic,
          lastUsed: serverTimestamp() as Timestamp
        };
        
        await setDoc(sessionRef, sessionData);
        console.log("Created new Athro session:", sessionId);
      } else {
        // Update existing session with new data
        await updateDoc(sessionRef, {
          messages: latestMessages,
          lastTopic: lastTopic || null,
          lastUsed: serverTimestamp()
        });
        console.log("Updated Athro session:", sessionId);
      }
    } catch (error) {
      console.error("Error saving Athro session to Firestore:", error);
      // Don't throw error - gracefully fail for sessions
    }
  }
  
  /**
   * Appends a new message to an existing Athro session
   */
  static async addMessage(
    userId: string, 
    subject: string, 
    message: AthroMessage
  ): Promise<void> {
    try {
      if (!userId || !subject) {
        throw new Error("User ID and subject are required");
      }
      
      const sessionId = this.getSessionId(userId, subject);
      const sessionRef = doc(db, SESSION_COLLECTION, sessionId);
      
      const newMessage: AthroSessionMessage = {
        role: message.senderId === 'user' ? 'user' : 'athro',
        content: message.content,
        timestamp: Timestamp.fromDate(new Date(message.timestamp))
      };
      
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        // Create new session document with this message
        const sessionData: AthroSession = {
          userId,
          subject,
          messages: [newMessage],
          lastUsed: serverTimestamp() as Timestamp
        };
        
        await setDoc(sessionRef, sessionData);
        console.log("Created new Athro session with message:", sessionId);
      } else {
        // Check if we need to limit the number of messages
        const currentData = sessionDoc.data() as AthroSession;
        
        if (currentData.messages && currentData.messages.length >= MAX_MESSAGES_STORED) {
          // Remove oldest message and add new one at the end
          const updatedMessages = [
            ...currentData.messages.slice(1),
            newMessage
          ];
          
          await updateDoc(sessionRef, {
            messages: updatedMessages,
            lastUsed: serverTimestamp()
          });
        } else {
          // Just add the new message using arrayUnion
          await updateDoc(sessionRef, {
            messages: arrayUnion(newMessage),
            lastUsed: serverTimestamp()
          });
        }
        
        console.log("Added message to Athro session:", sessionId);
      }
    } catch (error) {
      console.error("Error adding message to Athro session:", error);
      // Don't throw error - gracefully fail for sessions
    }
  }
  
  /**
   * Retrieves an Athro session from Firestore
   */
  static async getSession(userId: string, subject: string): Promise<AthroMessage[] | null> {
    try {
      if (!userId || !subject) {
        throw new Error("User ID and subject are required");
      }
      
      const sessionId = this.getSessionId(userId, subject);
      const sessionRef = doc(db, SESSION_COLLECTION, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data() as AthroSession;
        
        // Update the last used timestamp
        await updateDoc(sessionRef, {
          lastUsed: serverTimestamp()
        });
        
        // Convert Firestore messages to AthroMessage format
        if (sessionData.messages && sessionData.messages.length > 0) {
          return sessionData.messages.map((msg, index) => ({
            id: `${sessionId}_${index}`,
            senderId: msg.role === 'user' ? 'user' : subject,
            content: msg.content,
            timestamp: msg.timestamp.toDate().toISOString()
          }));
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting Athro session from Firestore:", error);
      return null;
    }
  }
  
  /**
   * Gets all sessions for a user
   */
  static async getUserSessions(userId: string): Promise<{subject: string, lastUsed: Date}[]> {
    try {
      const sessionsQuery = query(
        collection(db, SESSION_COLLECTION),
        where("userId", "==", userId),
        orderBy("lastUsed", "desc")
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const sessions: {subject: string, lastUsed: Date}[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as AthroSession;
        sessions.push({
          subject: data.subject,
          lastUsed: data.lastUsed.toDate()
        });
      });
      
      return sessions;
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }
}

export default AthroSessionFirestoreService;
