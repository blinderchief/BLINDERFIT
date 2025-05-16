const functions = require('firebase-functions');
const admin = require('firebase-admin');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Store active connections
const activeConnections = new Map();

// Initialize WebSocket server
const initializeWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    const connectionId = uuidv4();
    
    // Store connection with metadata
    activeConnections.set(connectionId, {
      ws,
      userId: null,
      lastActivity: Date.now()
    });
    
    // Handle authentication
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth' && data.token) {
          // Verify Firebase token
          admin.auth().verifyIdToken(data.token)
            .then((decodedToken) => {
              const userId = decodedToken.uid;
              
              // Update connection with user ID
              activeConnections.set(connectionId, {
                ws,
                userId,
                lastActivity: Date.now()
              });
              
              // Send confirmation
              ws.send(JSON.stringify({
                type: 'auth_success',
                userId
              }));
              
              // Subscribe to user's AI updates
              subscribeToUserUpdates(userId, connectionId);
            })
            .catch((error) => {
              ws.send(JSON.stringify({
                type: 'auth_error',
                error: 'Invalid authentication token'
              }));
            });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      const connection = activeConnections.get(connectionId);
      if (connection && connection.userId) {
        unsubscribeFromUserUpdates(connection.userId, connectionId);
      }
      activeConnections.delete(connectionId);
    });
  });
  
  return wss;
};

// Subscribe to user's AI updates
const subscribeToUserUpdates = (userId, connectionId) => {
  // Listen for real-time updates to user's AI interactions
  const unsubscribe = admin.firestore()
    .collection('ai_queries')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const latestQuery = snapshot.docs[0].data();
        
        // Get the connection
        const connection = activeConnections.get(connectionId);
        if (connection && connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify({
            type: 'ai_update',
            data: latestQuery
          }));
        }
      }
    });
  
  // Store unsubscribe function
  const connection = activeConnections.get(connectionId);
  if (connection) {
    activeConnections.set(connectionId, {
      ...connection,
      unsubscribe
    });
  }
};

// Unsubscribe from user's AI updates
const unsubscribeFromUserUpdates = (userId, connectionId) => {
  const connection = activeConnections.get(connectionId);
  if (connection && connection.unsubscribe) {
    connection.unsubscribe();
  }
};

// Send update to specific user
const sendUpdateToUser = (userId, data) => {
  for (const [connectionId, connection] of activeConnections.entries()) {
    if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(data));
    }
  }
};

module.exports = {
  initializeWebSocketServer,
  sendUpdateToUser
};