const API_URL = "http://localhost:4000/admin";

async function adminFetch(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Admin API request failed");
  }

  return res.json();
}

export function getDashboardOverview() {
  return adminFetch("/dashboard/overview");
}

export function getUsersGrowth() {
  return adminFetch("/dashboard/users-growth");
}

export function getLoginActivity(page = 1, limit = 10) {
  return adminFetch(`/login-activity?page=${page}&limit=${limit}`);
}

export function getActiveUsers(range: "24h" | "7d" | "30d" = "24h") {
  return adminFetch(`/dashboard/active-users?range=${range}`);
}

export function getAdminMe() {
  return fetch("http://localhost:4000/auth/me", {
    credentials: "include",
  }).then((res) => (res.ok ? res.json() : null));
}

export function getAnalyticsOverview() {
  return adminFetch("/analytics/overview");
}

export function getAnalyticsEngagementTrend() {
  return adminFetch("/analytics/engagement-trend");
}

export function getAnalyticsUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "Active" | "Banned";
}) {
  const q = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
    search: params.search ?? "",
    status: params.status ?? "all",
  });
  return adminFetch(`/analytics/users?${q}`);
}

export function getAnalyticsModelUsage() {
  return adminFetch("/analytics/model-usage");
}

// ================================
// USER MANAGEMENT
// ================================
export function getUserMetrics() {
  return adminFetch("/users/metrics");
}

export function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "banned";
}) {
  const q = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
    search: params.search ?? "",
    status: params.status ?? "all",
  });
  return adminFetch(`/users?${q}`);
}

export function banUser(id: string) {
  return fetch(`${API_URL}/users/${id}/ban`, {
    method: "PATCH",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Ban failed");
    return res.json();
  });
}

export function unbanUser(id: string) {
  return fetch(`${API_URL}/users/${id}/unban`, {
    method: "PATCH",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Unban failed");
    return res.json();
  });
}

export function deleteUser(id: string) {
  return fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  });
}

export function createUser(data: {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}) {
  return fetch(`${API_URL}/users`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error("Create user failed");
    return res.json();
  });
}

// ================================
// TOKENIZER
// ================================
export function getTokenizerOverview() {
  return adminFetch("/tokenizer/overview");
}

export function getTokenUsageHistory() {
  return adminFetch("/tokenizer/history");
}

export function getRecentTokenizations(limit = 5) {
  return adminFetch(`/tokenizer/recent?limit=${limit}`);
}

// ================================
// SYSTEM CONTROL
// ================================
export function getSystemFlags() {
  return adminFetch("/system/flags");
}

export function setSystemFlag(key: string, value: string) {
  return fetch(`${API_URL}/system/flags/${key}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update flag");
    return res.json();
  });
}

export function getSystemHealth() {
  return adminFetch("/system/health");
}

// ================================
// SYSTEM PROMPT
// ================================
export function getAdminSystemPrompt(): Promise<{ content: string }> {
  return adminFetch("/system/prompt");
}

export function updateAdminSystemPrompt(content: string) {
  return fetch(`${API_URL}/system/prompt`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update system prompt");
    return res.json();
  });
}

// ================================
// AI MODELS
// ================================
export function getAdminModels() {
  return adminFetch("/models");
}

export function createAdminModel(data: {
  name: string;
  provider: string;
  model_id: string;
  api_key: string;
  base_url: string;
  is_default: boolean;
}) {
  return fetch(`${API_URL}/models`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to create model");
    return res.json();
  });
}

export function updateAdminModel(id: string, data: Partial<{
  name: string; provider: string; model_id: string;
  api_key: string; base_url: string; enabled: boolean; is_default: boolean;
}>) {
  return fetch(`${API_URL}/models/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update model");
    return res.json();
  });
}

export function deleteAdminModel(id: string) {
  return fetch(`${API_URL}/models/${id}`, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to delete model");
    return res.json();
  });
}

// ================================
// ADMIN SETTINGS
// ================================
export function getAdminLoginHistory() {
  return adminFetch("/settings/login-history");
}

export function getSuspiciousActivity() {
  return adminFetch("/settings/suspicious-activity");
}

export function getNotificationStats() {
  return adminFetch("/settings/notification-stats");
}

export function adminLogout() {
  return fetch(`${API_URL}/settings/logout`, {
    method: "POST",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Logout failed");
    return res.json();
  });
}

export function getSupportTickets(status?: string) {
  const q = status ? `?status=${status}` : "";
  return adminFetch(`/support/tickets${q}`);
}

export function getSupportTicketDetail(id: string) {
  return adminFetch(`/support/tickets/${id}`);
}

export function updateSupportTicketStatus(id: string, status: string) {
  return fetch(`http://localhost:4000/admin/support/tickets/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update ticket status");
    return res.json();
  });
}

export function replySupportTicket(id: string, message: string) {
  return fetch(`http://localhost:4000/admin/support/tickets/${id}/reply`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to send reply");
    return res.json();
  });
}