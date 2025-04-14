
import { AthroMessage } from '@/types/athro';

// Mock data for Athro sessions
let mockSessions = [
  {
    id: 'session-1',
    userId: 'user-1',
    subject: 'Mathematics',
    topic: 'Algebra',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-1',
        content: "Hello! I need help with quadratic equations.",
        role: 'user',
        timestamp: new Date(Date.now() - 5000)
      },
      {
        id: 'msg-2',
        content: "I'd be happy to help you with quadratic equations. What specifically are you struggling with?",
        role: 'assistant',
        timestamp: new Date(Date.now() - 2000)
      }
    ]
  }
];

// Service for managing Athro sessions in Firestore
const athroSessionService = {
  // Get all sessions for a user
  async getUserSessions(userId: string) {
    // In a real implementation, this would query Firestore
    const userSessions = mockSessions.filter(session => session.userId === userId);
    return userSessions;
  },
  
  // Get a specific session by ID
  async getSession(sessionId: string) {
    // In a real implementation, this would query Firestore
    const session = mockSessions.find(s => s.id === sessionId);
    return session || null;
  },
  
  // Create a new session
  async createSession(data: {
    userId: string;
    subject: string;
    topic?: string;
  }) {
    // In a real implementation, this would add to Firestore
    const newSession = {
      id: `session-${Date.now()}`,
      userId: data.userId,
      subject: data.subject,
      topic: data.topic || '',
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    mockSessions.push(newSession);
    return newSession;
  },
  
  // Add a message to a session
  async addMessage(sessionId: string, message: AthroMessage) {
    // In a real implementation, this would update the Firestore document
    const session = mockSessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.messages.push({
      ...message,
      timestamp: message.timestamp
    });
    
    return message;
  },
  
  // Get messages for a session
  async getMessages(sessionId: string): Promise<AthroMessage[]> {
    // In a real implementation, this would query Firestore
    const session = mockSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return [];
    }
    
    return session.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: new Date(msg.timestamp)
    }));
  },
  
  // Update session metadata
  async updateSession(sessionId: string, data: {
    topic?: string;
    title?: string;
  }) {
    // In a real implementation, this would update the Firestore document
    const session = mockSessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    Object.assign(session, data);
    return session;
  },
  
  // Delete a session
  async deleteSession(sessionId: string) {
    // In a real implementation, this would delete from Firestore
    const initialCount = mockSessions.length;
    mockSessions = mockSessions.filter(s => s.id !== sessionId);
    
    return initialCount !== mockSessions.length;
  },
  
  // Get recent sessions
  async getRecentSessions(userId: string, limit = 5) {
    // In a real implementation, this would query Firestore with ordering and limiting
    const userSessions = mockSessions
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return userSessions;
  },
  
  // Mock session data for testing
  mockSessionData() {
    return mockSessions;
  }
};

export default athroSessionService;
