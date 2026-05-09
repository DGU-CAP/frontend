import axios from "axios";
import type {
  PodInfo,
  PodEvent,
  CurrentMetric,
  MetricPoint,
  Ticket,
  TicketActionLog,
  TicketDetail,
  UpdateStatusRequest,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? "알 수 없는 오류가 발생했습니다";
    return Promise.reject(new Error(message));
  }
);

export async function getPods(namespace?: string): Promise<PodInfo[]> {
  const { data } = await api.get("/pods", {
    params: namespace ? { namespace } : undefined,
  });
  return data;
}

export async function getPodEvents(
  podName: string,
  namespace?: string
): Promise<PodEvent[]> {
  const { data } = await api.get(`/pods/${podName}/events`, {
    params: namespace ? { namespace } : undefined,
  });
  return data;
}

export async function getTopology(namespace?: string): Promise<unknown> {
  const { data } = await api.get("/topology", {
    params: namespace ? { namespace } : undefined,
  });
  return data;
}

export async function getCurrentMetric(pod: string): Promise<CurrentMetric> {
  const { data } = await api.get("/metrics/current", { params: { pod } });
  return data;
}

export async function getRangeMetrics(
  pod: string,
  metric: "cpu" | "memory" | "error-rate",
  range: "30m" | "1h" | "6h" | "24h"
): Promise<MetricPoint[]> {
  const { data } = await api.get("/metrics/range", {
    params: { pod, metric, range },
  });
  return data;
}

export async function getLogs(pod: string): Promise<string[]> {
  const { data } = await api.get("/logs", { params: { pod } });
  return data;
}

export async function getTickets(
  status?: string,
  severity?: string
): Promise<Ticket[]> {
  const { data } = await api.get("/tickets", {
    params: {
      ...(status ? { status } : {}),
      ...(severity ? { severity } : {}),
    },
  });
  return data;
}

export async function getTicket(id: number | string): Promise<TicketDetail> {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
}

export async function updateTicketStatus(
  id: number | string,
  body: UpdateStatusRequest
): Promise<Ticket> {
  const { data } = await api.patch(`/tickets/${id}/status`, body);
  return data;
}

export async function getTicketLogs(
  id: number | string
): Promise<TicketActionLog[]> {
  const { data } = await api.get(`/tickets/${id}/logs`);
  return data;
}
