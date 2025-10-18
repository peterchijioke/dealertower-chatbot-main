import { useState, useRef, useCallback, useEffect } from 'react';
import { getAuthToken, logout } from '@/lib/auth';

/**
 * READY_STATE: 0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface Options {
  /** Required business param you already use */
  dealerId: string;
  /** Optional absolute ws url. If omitted, uses NEXT_PUBLIC_WEBSOCKET_URL */
  url?: string;
  /** Optional ws subprotocols */
  protocols?: string | string[];
  /** Max reconnect attempts for transient or auth errors */
  maxReconnectAttempts?: number; // default 6
  /** Base delay for backoff (ms) */
  baseReconnectDelayMs?: number; // default 1000
  /** Called when a message arrives */
  onMessage?: (msg: unknown) => void;
  /** Called on low-level ws error events */
  onError?: (err: Event) => void;
  /** Called when refresh fails (invalid refresh token) */
  onAuthLost?: () => void;
}

/**
 * Single-flight refresh helper. Coalesces concurrent refresh calls so
 * we never spam the refresh endpoint.
 */
// Removed refreshAccessTokenSingleFlight and inflightRefresh

function computeBackoff(attempt: number, baseMs: number, maxMs = 15000): number {
  // Exponential backoff with jitter
  const exp = Math.min(maxMs, baseMs * Math.pow(1.8, attempt));
  const jitter = exp * (Math.random() * 0.2); // ±20%
  return Math.round(exp + jitter);
}

// Be conservative: rely on codes primarily; only allow a few exact reasons
function isAuthFailureClose(event: CloseEvent): boolean {
  if (event.code === 1008 || event.reason === 'Auth failed') {
    return true;
  }
  const reason = (event.reason || '').toLowerCase();
  return reason === 'auth failed' || reason === 'invalid token' || reason === 'token expired';
}

export function useSimpleWebSocket({
  dealerId,
  url,
  protocols,
  maxReconnectAttempts = 6,
  baseReconnectDelayMs = 1000,
  onMessage,
  onError,
  onAuthLost,
}: Options) {
  const wsRef = useRef<WebSocket | null>(null);

  // keep latest handlers without changing connect() identity
  const onMessageRef = useRef<Options['onMessage']>();
  const onErrorRef = useRef<Options['onError']>();
  const onAuthLostRef = useRef<Options['onAuthLost']>();
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onAuthLostRef.current = onAuthLost; }, [onAuthLost]);

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  // Removed unmountedRef: socket should stay open even after component unmount
  const connectingRef = useRef(false);
  const shouldStayConnectedRef = useRef(false); // Track intention to stay connected
  const didAuthRefreshThisSessionRef = useRef(false); // guard one refresh per auth cycle

  const setStatusSafe = (next: WebSocketStatus) => {
    setStatus(prev => {
      if (prev !== next) {
        console.log(`[WebSocket] Status changed: ${prev} → ${next}`);
        return next;
      }
      return prev;
    });
  };

  // No reconnect timer needed

  const buildUrl = async (): Promise<string> => {
    const base = url ?? process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? '';
    if (!base) throw new Error('Missing NEXT_PUBLIC_WEBSOCKET_URL');

    const token = await getAuthToken();
    if (!token) {
      onAuthLostRef.current?.();
      throw new Error('No access token');
    }

    const q = new URLSearchParams({ dealer_id: dealerId, token });
    return base.includes('?') ? `${base}&${q.toString()}` : `${base}?${q.toString()}`;
  };

  // Store openSocket in a ref to make it stable
  const openSocketRef = useRef<(() => Promise<void>) | null>(null);

  const openSocket = useCallback(async () => {
    // Only connect once when requested
    if (connectingRef.current) {
      console.log('Already connecting, skipping...');
      return;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('Already connected, skipping...');
        return;
      }
      if (wsRef.current.readyState === WebSocket.CONNECTING) {
        console.log('Connection in progress, skipping...');
        return;
      }
    }
    if (!shouldStayConnectedRef.current) {
      console.log('Not supposed to be connected, skipping...');
      return;
    }
    connectingRef.current = true;
    setStatusSafe('connecting');
    try {
      const fullUrl = await buildUrl();
      console.log(`[WebSocket] Attempting connection to: ${fullUrl}`);
      const ws = new WebSocket(fullUrl, protocols);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        didAuthRefreshThisSessionRef.current = false;
        connectingRef.current = false;
        setStatusSafe('connected');
      };
      ws.onmessage = async (event) => {
        try {
          console.log('[WebSocket] Message received:', event.data);
          const text = typeof event.data === 'string' ? event.data : (event.data instanceof Blob ? await event.data.text() : '');
          let parsed: unknown = text;
          try { parsed = JSON.parse(text); } catch { /* noop: plain text */ }
          setLastMessage(parsed);
          onMessageRef.current?.(parsed);
        } catch (e) {
          console.error('[WebSocket] Error handling message:', e);
          const errEvt = new Event('error');
          onErrorRef.current?.(errEvt);
        }
      };
      ws.onerror = (evt) => {
        console.error('[WebSocket] Error event:', evt);
        connectingRef.current = false;
        setStatusSafe('error');
        onErrorRef.current?.(evt);
      };
      ws.onclose = async (event) => {
        console.warn('[WebSocket] Disconnected:', { code: event.code, reason: event.reason });
        wsRef.current = null;
        connectingRef.current = false;
        setStatusSafe('disconnected');
        if (event.code === 1011 || (event.reason && event.reason === 'Auth failed')) {
          logout();
          
          console.error('[WebSocket] Server error, connection closed.');
          shouldStayConnectedRef.current = false;
          onErrorRef.current?.(event);
          return;
        }
        // Handle auth failure
        if (isAuthFailureClose(event)) {
          console.error('[WebSocket] Auth failure; disconnecting and notifying user.');
          shouldStayConnectedRef.current = false;
          onAuthLostRef.current?.();
          return;
        }
        // Handle server error (code 1011)
        
        // No reconnect logic
      };
    } catch (err) {
      console.error('[WebSocket] Failed to create WebSocket:', err);
      connectingRef.current = false;
      try {
        const token = getAuthToken();
        if (!token) {
        }
      } catch {
        console.error('[WebSocket] Auth lost during connection attempt');
        onAuthLostRef.current?.();
        shouldStayConnectedRef.current = false;
        setStatusSafe('error');
        return;
      }
      // No reconnect logic
      return;
    }
  }, [dealerId, protocols, maxReconnectAttempts, baseReconnectDelayMs, url]);

  // Update the ref whenever openSocket changes
  useEffect(() => {
    openSocketRef.current = openSocket;
  }, [openSocket]);

  // Removed cleanup effect that disconnects on unmount

  // Idempotent connect: don't reset attempts if we're already trying/connected
  const connect = useCallback(() => {
    if (shouldStayConnectedRef.current) {
      const rs = wsRef.current?.readyState;
      if (rs === WebSocket.OPEN || rs === WebSocket.CONNECTING || connectingRef.current) {
        console.log('Connect requested but already connected/connecting; ignoring.');
        return;
      }
    }
    console.log('Connect requested - enabling shouldStayConnected');
    shouldStayConnectedRef.current = true;
    openSocketRef.current?.();
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnect requested - setting shouldStayConnected to false');
    shouldStayConnectedRef.current = false;
    connectingRef.current = false;
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      try {
        ws.close(1000, 'client disconnect');
      } catch {
        /* noop */
      }
    }
    setStatusSafe('disconnected');
  }, []);

  const sendMessage = useCallback((message: object) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);



  return {
    status,
    isConnected: status === 'connected',
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  } as const;
}
