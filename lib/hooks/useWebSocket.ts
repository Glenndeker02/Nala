// WebSocket Client Hook for React Components
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useWebSocket(token?: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!token) return;

        // Initialize socket connection
        socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
            path: '/api/socket',
            auth: { token },
            autoConnect: true
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('notification', (data: any) => {
            console.log('Received notification:', data);
            setNotifications(prev => [data, ...prev]);

            // Show toast notification
            // You can integrate with your toast library here
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [token]);

    const joinCampaign = useCallback((campaignId: string) => {
        if (socket && isConnected) {
            socket.emit('join-campaign', campaignId);
        }
    }, [isConnected]);

    const leaveCampaign = useCallback((campaignId: string) => {
        if (socket && isConnected) {
            socket.emit('leave-campaign', campaignId);
        }
    }, [isConnected]);

    const subscribe = useCallback((event: string, handler: (data: any) => void) => {
        if (socket) {
            socket.on(event, handler);
            return () => {
                socket?.off(event, handler);
            };
        }
    }, []);

    return {
        isConnected,
        notifications,
        joinCampaign,
        leaveCampaign,
        subscribe,
        socket
    };
}

// Hook for campaign-specific real-time updates
export function useCampaignRealtime(campaignId: string, token?: string) {
    const { isConnected, joinCampaign, leaveCampaign, subscribe } = useWebSocket(token);
    const [budgetData, setBudgetData] = useState<any>(null);
    const [progressData, setProgressData] = useState<any>(null);

    useEffect(() => {
        if (isConnected && campaignId) {
            joinCampaign(campaignId);

            const unsubBudget = subscribe?.('budget:updated', (data: any) => {
                setBudgetData(data);
            });

            const unsubProgress = subscribe?.('progress:updated', (data: any) => {
                setProgressData(data);
            });

            return () => {
                leaveCampaign(campaignId);
                unsubBudget?.();
                unsubProgress?.();
            };
        }
    }, [isConnected, campaignId, joinCampaign, leaveCampaign, subscribe]);

    return {
        isConnected,
        budgetData,
        progressData
    };
}
