// =============================================================
//  src/utils/formatters.js — Shared Utility Formatters
//
//  A collection of pure formatting functions used across
//  patient, doctor, and admin components.
// =============================================================

import dayjs from "dayjs";

/**
 * Formats a date string or Date object into "DD MMM YYYY"
 * e.g. "17 Jul 2026"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return "—";
  return dayjs(date).format("DD MMM YYYY");
}

/**
 * Formats a date string with full weekday name.
 * e.g. "Thursday, 17 July 2026"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateLong(date) {
  if (!date) return "—";
  return dayjs(date).format("dddd, DD MMMM YYYY");
}

/**
 * Returns a relative time string.
 * e.g. "3 hours ago", "in 2 days"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return "—";
  const diff = dayjs().diff(dayjs(date), "minute");
  if (Math.abs(diff) < 1) return "Just now";
  if (Math.abs(diff) < 60) return `${Math.abs(diff)}m ago`;
  const hours = Math.floor(Math.abs(diff) / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/**
 * Formats a currency amount.
 * e.g. formatCurrency(150) → "$150.00"
 *
 * @param {number} amount
 * @param {string} [currency="USD"]
 * @returns {string}
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a phone number for display.
 * Returns a tel: link-compatible string.
 *
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return "—";
  return phone.trim();
}

/**
 * Generates initials from a full name.
 * e.g. "John Smith" → "JS"
 *
 * @param {string} name
 * @param {number} [maxChars=2]
 * @returns {string}
 */
export function getInitials(name, maxChars = 2) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, maxChars)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * Returns a human-friendly label for appointment status values.
 *
 * @param {string} status - One of: pending, approved, rejected, completed, cancelled
 * @returns {string}
 */
export function formatAppointmentStatus(status) {
  const labels = {
    pending:   "Pending Approval",
    approved:  "Confirmed",
    rejected:  "Declined",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

/**
 * Truncates a string to maxLength characters, adding "…" if truncated.
 *
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 80) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}
