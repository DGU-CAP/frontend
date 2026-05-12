"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getRangeMetrics } from "../lib/api";

type MetricType = "cpu" | "memory" | "error-rate";
type RangeType = "30m" | "1h" | "6h" | "24h";

const RANGES: RangeType[] = ["30m", "1h", "6h", "24h"];

const LINE_COLOR: Record<MetricType, string> = {
  cpu: "#60a5fa",
  memory: "#34d399",
  "error-rate": "#f87171",
};

interface Props {
  podName: string;
  metric: MetricType;
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function MetricChart({ podName, metric }: Props) {
  const [range, setRange] = useState<RangeType>("30m");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["metrics-range", podName, metric, range],
    queryFn: () => getRangeMetrics(podName, metric, range),
  });

  const chartData = data?.map((p) => ({
    time: formatTime(p.timestamp),
    value: p.value,
  }));

  const isEmpty = !isLoading && !isError && (!chartData || chartData.length === 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              range === r
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="h-48 bg-gray-800 rounded animate-pulse" />
      )}

      {isError && (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm bg-gray-800 rounded">
          데이터를 불러올 수 없습니다
        </div>
      )}

      {isEmpty && (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm bg-gray-800 rounded">
          데이터 없음
        </div>
      )}

      {!isLoading && !isError && !isEmpty && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#f9fafb",
                fontSize: "12px",
              }}
              formatter={(v) => [`${Number(v)}%`, metric]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={LINE_COLOR[metric]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
