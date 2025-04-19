
// Update the message object to include the required 'role' property
const userMessage = {
  id: Date.now().toString(),
  role: 'user',
  senderId: 'user',
  content: message,
  timestamp: new Date().toISOString(),
};
