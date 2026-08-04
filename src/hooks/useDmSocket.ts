"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { DEFAULT_PUBLIC_API_BASE_URL } from "@/lib/public-api-base-url";
import { getSocketTicket } from "@/services/dm.service";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_PUBLIC_API_BASE_URL;

/**
 * Connects to the /dm socket namespace using a 30s single-purpose ticket
 * (never the real access token — that stays server-side behind the proxy).
 * Reconnects fetch a fresh ticket each time since the old one has expired.
 */
export function useDmSocket(enabled: boolean) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let activeSocket: Socket | null = null;

    async function connect() {
      const ticket = await getSocketTicket();
      if (cancelled) return;
      activeSocket = io(`${API_BASE}/dm`, {
        auth: { token: ticket },
        transports: ["websocket"],
      });
      activeSocket.on("connect_error", async () => {
        // Ticket likely expired before the handshake completed — refresh and retry once.
        const freshTicket = await getSocketTicket().catch(() => null);
        if (freshTicket && activeSocket) {
          activeSocket.auth = { token: freshTicket };
          activeSocket.connect();
        }
      });
      socketRef.current = activeSocket;
      setSocket(activeSocket);
    }

    connect();

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [enabled]);

  return socket;
}
