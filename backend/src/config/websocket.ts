/**
 * WebSocket Server Configuration
 * Handles real-time notification delivery using Socket.io
 */

import { Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './db';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
}

let io: SocketIOServer | null = null;

/**
 * Initialize WebSocket server with Express HTTP server
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
       socket.userId = decoded.userId;
       socket.organizationId = decoded.organizationId;

       // Verify user still exists and is active
       const user = await prisma.user.findFirst({
         where: { id: decoded.userId, organizationId: decoded.organizationId, isActive: true },
       });

      if (!user) {
        return next(new Error('User not found or inactive'));
      }

      next();
    } catch (error) {
      console.error('❌ [WebSocket] Authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const orgId = socket.organizationId!;

    console.log(`✅ [WebSocket] User ${userId} connected (${socket.id})`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);
    socket.join(`org:${orgId}`);

    // Emit initial connection success
    socket.emit('connected', {
      userId,
      organizationId: orgId,
      socketId: socket.id,
      timestamp: new Date(),
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👋 [WebSocket] User ${userId} disconnected`);
    });

    // Health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });
  });

  console.log('✅ [WebSocket] Server initialized with Socket.io');
  return io;
}

/**
 * Get the initialized WebSocket server
 */
export function getWebSocket(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return io;
}

/**
 * Notify a specific user
 */
export function notifyUser(userId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
  console.log(`📤 [WebSocket] Event "${event}" sent to user ${userId}`);
}

/**
 * Notify all users in an organization
 */
export function notifyOrganization(organizationId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`org:${organizationId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
  console.log(`📤 [WebSocket] Event "${event}" sent to org ${organizationId}`);
}

/**
 * Notify multiple users
 */
export function notifyUsers(userIds: string[], event: string, data: any): void {
  if (!io) return;
  userIds.forEach(userId => {
    io!.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  });
  console.log(`📤 [WebSocket] Event "${event}" sent to ${userIds.length} users`);
}

/**
 * Get online users for an organization
 */
export function getOnlineUsers(organizationId: string): string[] {
  if (!io) return [];
  
  const sockets = io.sockets.sockets;
  const onlineUsers: Set<string> = new Set();
  
  sockets.forEach((socket: AuthenticatedSocket) => {
    if (socket.organizationId === organizationId && socket.userId) {
      onlineUsers.add(socket.userId);
    }
  });

  return Array.from(onlineUsers);
}

/**
 * Get connection count for an organization
 */
export function getOrgConnectionCount(organizationId: string): number {
  if (!io) return 0;
  
  const sockets = io.sockets.sockets;
  let count = 0;
  
  sockets.forEach((socket: AuthenticatedSocket) => {
    if (socket.organizationId === organizationId) {
      count++;
    }
  });

  return count;
}

export default {
  initializeWebSocket,
  getWebSocket,
  notifyUser,
  notifyOrganization,
  notifyUsers,
  getOnlineUsers,
  getOrgConnectionCount,
};
