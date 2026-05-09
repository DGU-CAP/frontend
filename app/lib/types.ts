export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type AnomalyType =
  | "CPU_HIGH"
  | "MEMORY_HIGH"
  | "POD_RESTART"
  | "ERROR_RATE_HIGH"
  | "OOM_KILLED"
  | "CRASH_LOOP";

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  podName: string;
  namespace: string;
  nodeName: string;
  anomalyType: AnomalyType;
  metricValue: number;
  threshold: number;
  severity: Severity;
  status: TicketStatus;
  aiAnalysis: string;
  recommendation: string;
  similarCases: string;
  assigneeName: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface TicketActionLog {
  id: number;
  action: string;
  memo: string;
  performedBy: string;
  createdAt: string;
}

export interface TicketMetricSnapshot {
  id: number;
  cpu: number;
  memory: number;
  restarts: number;
  errorRate: number;
  capturedAt: string;
}

export interface PodInfo {
  podName: string;
  namespace: string;
  nodeName: string;
  phase: string;
  ready: boolean;
  restartCount: number;
  containers: string[];
}

export interface PodEvent {
  type: string;
  reason: string;
  message: string;
  count: number;
}

export interface CurrentMetric {
  podName: string;
  cpu: number;
  memory: number;
  restarts: number;
  errorRate: number;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface AlertEvent {
  podName: string;
  anomalyType: AnomalyType;
}

export interface UpdateStatusRequest {
  status: TicketStatus;
  action: string;
  memo: string;
  performedBy: string;
}

export interface TicketDetail {
  ticket: Ticket;
  metricSnapshot: TicketMetricSnapshot | null;
  actionLogs: TicketActionLog[];
}
