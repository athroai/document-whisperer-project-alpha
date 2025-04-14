
import { db } from '@/config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export interface CalendarEvent {
  id?: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  duration?: number;
  mentor?: string;
  type?: 'study' | 'quiz' | 'revision';
  createdAt?: Date;
}

export const calendarService = {
  // Create a new calendar event
  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'calendarEvents'), {
        ...event,
        date: Timestamp.fromDate(event.date),
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  },

  // Get all events for a specific user
  async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(
        eventsRef, 
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const events: CalendarEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          date: data.date.toDate(),
          time: data.time,
          duration: data.duration,
          mentor: data.mentor,
          type: data.type,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      return events;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  },

  // Get events for a specific date range
  async getEventsInDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(
        eventsRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const events: CalendarEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          date: data.date.toDate(),
          time: data.time,
          duration: data.duration,
          mentor: data.mentor,
          type: data.type,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      return events;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }
};

export default calendarService;
