"use client";

import { useQuery } from "@tanstack/react-query";
import { getPods, getTickets } from "./lib/api";
import { useAlertStore } from "./store/useAlertStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useRouter } from "next/navigation";
import type { Severity, TicketStatus } from "./lib/types";

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

function SkeletonCard() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const unreadCount = useAlertStore((s) => s.unreadCount);

  const {
    data: pods,
    isLoading: podsLoading,
    isError: podsError,
  } = useQuery({ queryKey: ["pods"], queryFn: () => getPods() });

  const {
    data: tickets,
    isLoading: ticketsLoading,
    isError: ticketsError,
  } = useQuery({ queryKey: ["tickets"], queryFn: () => getTickets() });

  const criticalCount =
    tickets?.filter((t) => t.severity === "CRITICAL").length ?? 0;
  const openCount = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
  const recentTickets = tickets?.slice(0, 5) ?? [];

  const isLoading = podsLoading || ticketsLoading;
  const isError = podsError || ticketsError;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">대시보드</h1>

      {isError && (
        <Card className="bg-red-950 border-red-800">
          <CardContent className="p-4 text-red-300 text-sm">
            백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">
                  전체 Pod 수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {pods?.length ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">
                  CRITICAL 티켓
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">
                  {criticalCount}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">
                  OPEN 티켓
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{openCount}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">
                  읽지 않은 알람
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-400">
                  {unreadCount}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base">최근 티켓</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ticketsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
                  <TableHead className="text-gray-400">심각도</TableHead>
                  <TableHead className="text-gray-400">상태</TableHead>
                  <TableHead className="text-gray-400">생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500 py-8"
                    >
                      티켓이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTickets.map((ticket) => (
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
