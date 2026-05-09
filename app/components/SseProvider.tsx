"use client";

import { useEffect, useRef } from "react";
import { useAlertStore } from "../store/useAlertStore";

const SSE_URL =
  process.env.NEXT_PUBLIC_SSE_URL ?? "http://localhost:8080/api/stream";

export default function SseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const addAlert = useAlertStore((s) => s.addAlert);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function connect() {
    const es = new EventSource(SSE_URL);
    esRef.current = es;

    es.addEventListener("NEW_ALERT", (e) => {
      try {
        addAlert(JSON.parse(e.data));
      } catch {
        // malformed payload — ignore
      }
    });

    es.addEventListener("TICKET_UPDATED", (e) => {
      console.log("[SSE] TICKET_UPDATED", e.data);
    });

    es.addEventListener("POD_STATUS", (e) => {
      console.log("[SSE] POD_STATUS", e.data);
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      reconnectTimer.current = setTimeout(connect, 3000);
    };
  }

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
