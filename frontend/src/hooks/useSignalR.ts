import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Notification } from '../types';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export const useSignalR = (onNotification: (notification: Notification) => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/notificationHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log('SignalR Connected');
      })
      .catch((err) => {
        console.error('SignalR Connection Error:', err);
      });

    connection.on('ReceiveNotification', (notification: Notification) => {
      onNotification(notification);
      toast.success(notification.message, {
        duration: 5000,
        position: 'top-right',
      });
    });

    return () => {
      connection.stop();
    };
  }, [onNotification]);

  return connectionRef.current;
};

