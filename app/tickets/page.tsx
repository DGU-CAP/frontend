"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getTickets } from "../lib/api";
import { useAlertStore } from "../store/useAlertStore";
import type { Severity, TicketStatus } from "../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import AlertBanner from "../components/AlertBanner";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "OPEN", label: "OPEN" },
  { value: "IN_PROGRESS", label: "IN_PROGRESS" },
  { value: "RESOLVED", label: "RESOLVED" },
  { value: "CLOSED", label: "CLOSED" },
];

const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체 심각도" },
  { value: "CRITICAL", label: "CRITICAL" },
  { value: "HIGH", label: "HIGH" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "LOW", label: "LOW" },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const colorMap: Record<Severity, string> = {
    CRITICAL: "bg-red-600 text-white",
    HIGH: "bg-orange-500 text-white",
    MEDIUM: "bg-yellow-500 text-black",
    LOW: "bg-blue-500 text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[severity]}`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const colorMap: Record<TicketStatus, string> = {
    OPEN: "bg-red-900 text-red-300",
    IN_PROGRESS: "bg-blue-900 text-blue-300",
    RESOLVED: "bg-green-900 text-green-300",
    CLOSED: "bg-gray-700 text-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[status]}`}
    >
      {status}
    </span>
  );
}

export default function TicketsPage() {
  const router = useRouter();
  const [statusTab, setStatusTab] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [hasNewTicket, setHasNewTicket] = useState(false);

  const alerts = useAlertStore((s) => s.alerts);
  const prevAlertCount = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > prevAlertCount.current) {
      setHasNewTicket(true);
    }
    prevAlertCount.current = alerts.length;
  }, [alerts]);

  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: ["tickets", statusTab, severity],
    queryFn: () =>
      getTickets(
        statusTab !== "ALL" ? statusTab : undefined,
        severity !== "ALL" ? severity : undefined
      ),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">티켓</h1>

      {hasNewTicket && (
        <AlertBanner
          onRefresh={refetch}
          onClose={() => setHasNewTicket(false)}
        />
      )}

      {isError && (
        <Card className="bg-red-950 border-red-800">
          <CardContent className="p-4 text-red-300 text-sm">
            티켓 정보를 불러올 수 없습니다.
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="bg-gray-800">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
          <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {SEVERITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-gray-200">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">번호</TableHead>
                  <TableHead className="text-gray-400">제목</TableHead>
                  <TableHead className="text-gray-400">Pod</TableHead>
                  <TableHead className="text-gray-400">이상 유형</TableHead>
                  <TableHead className="text-gray-400">심각도</TableHead>
                  <TableHead className="text-gray-400">상태</TableHead>
                  <TableHead className="text-gray-400">생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!tickets || tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-8"
                    >
                      티켓이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-gray-800 cursor-pointer hover:bg-gray-800"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <TableCell className="text-gray-300 font-mono text-xs">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="text-white text-sm">
                        {ticket.title}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {ticket.podName}
                      </TableCell>
                      <TableCell className="text-gray-300 text-xs">
                        {ticket.anomalyType}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={ticket.severity} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {new Date(ticket.createdAt).toLocaleString("ko-KR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
