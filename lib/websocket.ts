import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verify } from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
    if (io) {
        console.log('WebSocket already initialized');
        return io;
    }

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/api/socket'
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Authenticate socket connection
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log('No token provided, disconnecting');
            socket.disconnect();
            return;
        }

        try {
            const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };

            // Store user info in socket
            socket.data.userId = decoded.userId;
            socket.data.role = decoded.role;

            // Join user-specific room
            socket.join(`user:${decoded.userId}`);

            console.log(`User ${decoded.userId} connected to WebSocket`);

            // Handle joining campaign rooms
            socket.on('join-campaign', (campaignId: string) => {
                socket.join(`campaign:${campaignId}`);
                console.log(`User ${decoded.userId} joined campaign:${campaignId}`);
            });

            // Handle leaving campaign rooms
            socket.on('leave-campaign', (campaignId: string) => {
                socket.leave(`campaign:${campaignId}`);
                console.log(`User ${decoded.userId} left campaign:${campaignId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

        } catch (error) {
            console.error('WebSocket authentication error:', error);
            socket.disconnect();
        }
    });

    console.log('WebSocket server initialized');
    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
    }
    return io;
}

// Helper function to emit to specific user
export function emitToUser(userId: string, event: string, data: any) {
    if (!io) {
        console.warn('WebSocket not initialized, cannot emit to user');
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
}

// Helper function to emit to campaign room
export function emitToCampaign(campaignId: string, event: string, data: any) {
    if (!io) {
        console.warn('WebSocket not initialized, cannot emit to campaign');
        return;
    }
    io.to(`campaign:${campaignId}`).emit(event, data);
}

// Helper function to emit to all connected clients
export function emitToAll(event: string, data: any) {
    if (!io) {
        console.warn('WebSocket not initialized, cannot emit to all');
        return;
    }
    io.emit(event, data);
}
