import { useState, useEffect, useRef } from 'react';

export const useWs = (url: string) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsReady(true);
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
      startHeartbeat();
    };

    socket.onmessage = event => {
      setVal(event.data); // No need to parse if the message is a string
    };

    socket.onclose = () => {
      setIsReady(false);
      stopHeartbeat();
      retryConnection();
    };

    socket.onerror = error => {
      setIsReady(false);
      stopHeartbeat();
      retryConnection();
    };

    ws.current = socket;
  };

  const retryConnection = () => {
    if (!retryTimeout.current) {
      retryTimeout.current = setTimeout(() => {
        connect();
      }, 3000); // Retry every 3 seconds
    }
  };

  const startHeartbeat = () => {
    heartbeatInterval.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send('ping');
      }
    }, 30000); // 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      stopHeartbeat();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return [isReady, val, sendMessage] as const;
};
