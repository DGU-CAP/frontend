"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getTicket, getTicketLogs, updateTicketStatus } from "../../lib/api";
import type { TicketStatus } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";

const STATUS_OPTIONS: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-white break-all">{value ?? "-"}</span>
    </div>
  );
}

function MetricCell({
  label,
  value,
  unit = "%",
  warn,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold mt-1 ${warn ? "text-red-400" : "text-white"}`}>
        {value != null ? `${value}${unit}` : "-"}
      </p>
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
        type === "success" ? "bg-green-700" : "bg-red-700"
      }`}
    >
      {message}
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<TicketStatus>("OPEN");
  const [action, setAction] = useState("");
  const [memo, setMemo] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id),
  });

  const ticket = detail?.ticket;
  const snapshot = detail?.metricSnapshot;

  useEffect(() => {
    if (ticket) setStatus(ticket.status);
  }, [ticket]);

  const { data: logs } = useQuery({
    queryKey: ["ticket-logs", id],
    queryFn: () => getTicketLogs(id),
  });

  const mutation = useMutation({
    mutationFn: () =>
      updateTicketStatus(id, { status, action, memo, performedBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["ticket-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setAction("");
      setMemo("");
      setPerformedBy("");
      showToast("저장되었습니다", "success");
    },
    onError: () => {
      showToast("저장에 실패했습니다", "error");
    },
  });

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <Card className="bg-red-950 border-red-800">
        <CardContent className="p-4 text-red-300">
          티켓을 불러올 수 없습니다.
        </CardContent>
      </Card>
    );
  }

  const similarCasesList = ticket.similarCases
    ? ticket.similarCases.split("\n").filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← 뒤로
        </button>
        <h1 className="text-2xl font-bold text-white">
          [{ticket.ticketNumber}] {ticket.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 왼쪽 영역 */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">티켓 기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="티켓 번호" value={ticket.ticketNumber} />
              <InfoRow label="Pod" value={ticket.podName} />
              <InfoRow label="Namespace" value={ticket.namespace} />
              <InfoRow label="Node" value={ticket.nodeName} />
              <InfoRow label="이상 유형" value={ticket.anomalyType} />
              <InfoRow
                label="생성일"
                value={new Date(ticket.createdAt).toLocaleString("ko-KR")}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">AI 분석 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {ticket.aiAnalysis || "분석 결과가 없습니다"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">권고 조치</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {ticket.recommendation || "권고 조치가 없습니다"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">유사 사례</CardTitle>
            </CardHeader>
            <CardContent>
              {similarCasesList.length === 0 ? (
                <p className="text-sm text-gray-500">유사 사례가 없습니다</p>
              ) : (
                <ul className="space-y-1">
                  {similarCasesList.map((c, i) => (
                    <li key={i} className="text-sm text-gray-200 flex gap-2">
                      <span className="text-gray-500">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 영역 */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">메트릭 스냅샷</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot ? (
                <div className="grid grid-cols-2 gap-3">
                  <MetricCell label="CPU" value={snapshot.cpu} warn={snapshot.cpu > 90} />
                  <MetricCell label="메모리" value={snapshot.memory} warn={snapshot.memory > 85} />
                  <MetricCell label="재시작" value={snapshot.restarts} unit="회" warn={snapshot.restarts >= 3} />
                  <MetricCell label="에러율" value={snapshot.errorRate} warn={snapshot.errorRate > 10} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <MetricCell label="감지 값" value={ticket.metricValue} warn={ticket.metricValue > ticket.threshold} />
                  <MetricCell label="임계치" value={ticket.threshold} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">상태 변경</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">상태</label>
                <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-gray-200">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">조치 내용</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="수행한 조치를 입력하세요"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">메모</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">담당자</label>
                <input
                  type="text"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !action || !performedBy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {mutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">조치 이력</CardTitle>
            </CardHeader>
            <CardContent>
              {!logs || logs.length === 0 ? (
                <p className="text-sm text-gray-500">이력이 없습니다</p>
              ) : (
                <ol className="relative border-l border-gray-700 space-y-4 ml-2">
                  {logs.map((log) => (
                    <li key={log.id} className="ml-4">
                      <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-blue-500" />
                      <p className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString("ko-KR")} —{" "}
                        <span className="text-gray-300">{log.performedBy}</span>
                      </p>
                      <p className="text-sm text-white mt-0.5">{log.action}</p>
                      {log.memo && (
                        <p className="text-xs text-gray-400 mt-0.5">{log.memo}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
