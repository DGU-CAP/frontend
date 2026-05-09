import { create } from "zustand";
import type { AlertEvent } from "../lib/types";

interface AlertStore {
  alerts: AlertEvent[];
  unreadCount: number;
  addAlert: (alert: AlertEvent) => void;
  clearAlerts: () => void;
  markAllRead: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    })),
  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
  markAllRead: () => set({ unreadCount: 0 }),
}));
