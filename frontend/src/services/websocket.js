/**
 * MargaDrishti (मार्गदृष्टि) - Live WebSocket Service
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/events';

export function createWebSocketConnection(onMessage, onStatusChange) {
  let socket = null;
  let reconnectTimeout = null;
  let isIntentionallyClosed = false;

  function connect() {
    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('[WS] Connected to MargaDrishti live telemetry stream.');
        if (onStatusChange) onStatusChange('CONNECTED');
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onMessage) onMessage(parsed);
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      socket.onclose = () => {
        if (onStatusChange) onStatusChange('DISCONNECTED');
        if (!isIntentionallyClosed) {
          console.log('[WS] Connection lost. Reconnecting in 3s...');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (err) => {
        console.warn('[WS] Socket error:', err);
      };
    } catch (e) {
      console.error('[WS] Connection exception:', e);
      if (onStatusChange) onStatusChange('ERROR');
      reconnectTimeout = setTimeout(connect, 3000);
    }
  }

  connect();

  return {
    close: () => {
      isIntentionallyClosed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    }
  };
}
