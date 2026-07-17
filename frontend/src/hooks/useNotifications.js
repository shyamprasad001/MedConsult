// =============================================================
//  src/hooks/useNotifications.js — Notification Polling Hook
//
//  Polls the notifications API at a configurable interval and
//  exposes:
//    notifications   — array of notification objects
//    unreadCount     — integer count of unread notifications
//    markRead(id)    — marks a single notification as read
//    markAllRead()   — marks all notifications as read
//    refresh()       — manually triggers a re-fetch
// =============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "../api/services";
import { useAuth } from "../context/AuthContext";

const DEFAULT_POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * useNotifications
 *
 * @param {number} [pollIntervalMs=30000] - How often to poll for new notifications (ms).
 *   Set to 0 to disable automatic polling.
 * @returns {{
 *   notifications: Array,
 *   unreadCount: number,
 *   loading: boolean,
 *   markRead: (id: string) => Promise<void>,
 *   markAllRead: () => Promise<void>,
 *   refresh: () => void,
 * }}
 */
export function useNotifications(pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  const intervalRef = useRef(null);

  // ── Core fetch ──────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        notificationService.getAll({ limit: 20 }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data.data.notifications || []);
      setUnreadCount(countRes.data.data.count || 0);
    } catch {
      // Silently swallow errors to avoid flooding console during polling
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── Initial fetch + polling setup ───────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();

    if (pollIntervalMs > 0) {
      intervalRef.current = setInterval(fetchNotifications, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchNotifications, pollIntervalMs]);

  // ── Actions ─────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently ignore
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
