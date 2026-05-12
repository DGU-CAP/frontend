"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "../store/useAlertStore";

const SSE_URL =
  process.env.NEXT_PUBLIC_SSE_URL ?? "http://localhost:8080/api/stream";

export default function SseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const addAlert = useAlertStore((s) => s.addAlert);
  const queryClient = useQueryClient();
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
      try {
        const { ticketId } = JSON.parse(e.data) as { ticketId: number; status: string };
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
        queryClient.invalidateQueries({ queryKey: ["ticket", String(ticketId)] });
      } catch {
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
      }
    });

    es.addEventListener("POD_STATUS", () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
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
