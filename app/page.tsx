"use client";

import { useQuery } from "@tanstack/react-query";
import { getPods, getTickets } from "./lib/api";
import { useAlertStore } from "./store/useAlertStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SeverityBadge({ severity }: { severity: Severity }) {
  const colorMap: Record<Severity, string> = {
    CRITICAL: "bg-red-600 text-white",
    HIGH: "bg-orange-500 text-white",
    MEDIUM: "bg-yellow-500 text-black",
    LOW: "bg-blue-500 text-white",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[severity]}`}>
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[status]}`}>
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

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
};

const ANOMALY_LABELS: Record<string, string> = {
  CPU_HIGH: "CPU",
  MEMORY_HIGH: "MEM",
  POD_RESTART: "재시작",
  ERROR_RATE_HIGH: "에러율",
  OOM_KILLED: "OOM",
  CRASH_LOOP: "크래시",
};

export default function DashboardPage() {
  const router = useRouter();
  const { alerts, unreadCount } = useAlertStore();

  const { data: pods, isLoading: podsLoading, isError: podsError } = useQuery({
    queryKey: ["pods"],
    queryFn: () => getPods(),
    refetchInterval: 30000,
  });

  const { data: tickets, isLoading: ticketsLoading, isError: ticketsError } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => getTickets(),
    refetchInterval: 30000,
  });

  const isLoading = podsLoading || ticketsLoading;
  const isError = podsError || ticketsError;

  const criticalCount = tickets?.filter((t) => t.severity === "CRITICAL").length ?? 0;
  const openCount = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
  const recentTickets = tickets?.slice(0, 5) ?? [];

  // 심각도 분포
  const severityData = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[])
    .map((s) => ({ name: s, value: tickets?.filter((t) => t.severity === s).length ?? 0 }))
    .filter((d) => d.value > 0);

  // 이상 유형 분포
  const anomalyMap: Record<string, number> = {};
  tickets?.forEach((t) => {
    anomalyMap[t.anomalyType] = (anomalyMap[t.anomalyType] ?? 0) + 1;
  });
  const anomalyData = Object.entries(anomalyMap)
    .map(([type, count]) => ({ name: ANOMALY_LABELS[type] ?? type, count }))
    .sort((a, b) => b.count - a.count);

  // Pod 상태
  const runningCount = pods?.filter((p) => p.phase === "Running").length ?? 0;
  const unhealthyPods = pods?.filter((p) => p.phase !== "Running" || p.restartCount >= 3) ?? [];

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

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">전체 Pod 수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{pods?.length ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Running {runningCount}개</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal flex items-center gap-2">
                  CRITICAL 티켓
                  {criticalCount > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">OPEN 티켓</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{openCount}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 font-normal">읽지 않은 알람</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-400">{unreadCount}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 심각도 분포 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">심각도 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {!tickets || severityData.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">티켓 데이터가 없습니다</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                      {severityData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name as Severity]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                      itemStyle={{ color: "#e5e7eb" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {severityData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[d.name as Severity] }} />
                      <span className="text-gray-400 w-20">{d.name}</span>
                      <span className="text-white font-medium">{d.value}건</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이상 유형 분포 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">이상 유형 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {anomalyData.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">티켓 데이터가 없습니다</p>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={anomalyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                    itemStyle={{ color: "#e5e7eb" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="count" fill="#60a5fa" radius={[3, 3, 0, 0]} name="건수" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pod 상태 + 최근 알람 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pod 상태 요약 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center justify-between">
              <span>Pod 상태</span>
              <span className="text-xs font-normal">
                <span className="text-green-400">{runningCount}</span>
                <span className="text-gray-500"> / {pods?.length ?? 0} Running</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {podsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : unhealthyPods.length === 0 ? (
              <p className="text-sm text-green-400 py-2">모든 Pod가 정상입니다</p>
            ) : (
              <ul className="space-y-2">
                {unhealthyPods.slice(0, 5).map((pod) => (
                  <li key={`${pod.namespace}/${pod.podName}`} className="flex items-center justify-between text-sm">
                    <span className="text-gray-200 truncate max-w-[60%]">{pod.podName}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {pod.phase !== "Running" && (
                        <span className="text-xs bg-red-900 text-red-300 px-1.5 py-0.5 rounded">{pod.phase}</span>
                      )}
                      {pod.restartCount >= 3 && (
                        <span className="text-xs text-orange-400">재시작 {pod.restartCount}회</span>
                      )}
                    </div>
                  </li>
                ))}
                {unhealthyPods.length > 5 && (
                  <p className="text-xs text-gray-500">외 {unhealthyPods.length - 5}개</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 최근 알람 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">최근 알람</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">수신된 알람이 없습니다</p>
            ) : (
              <ul className="space-y-2">
                {alerts.slice(0, 6).map((alert, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-200 truncate max-w-[60%]">{alert.podName}</span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded shrink-0">
                      {ANOMALY_LABELS[alert.anomalyType] ?? alert.anomalyType}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 티켓 */}
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
                  <TableHead className="text-gray-400">Pod</TableHead>
                  <TableHead className="text-gray-400">이상유형</TableHead>
                  <TableHead className="text-gray-400">심각도</TableHead>
                  <TableHead className="text-gray-400">상태</TableHead>
                  <TableHead className="text-gray-400">생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
                      <TableCell className="text-gray-300 font-mono text-xs">{ticket.ticketNumber}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{ticket.podName}</TableCell>
                      <TableCell className="text-gray-300 text-xs">{ticket.anomalyType}</TableCell>
                      <TableCell><SeverityBadge severity={ticket.severity} /></TableCell>
                      <TableCell><StatusBadge status={ticket.status} /></TableCell>
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
