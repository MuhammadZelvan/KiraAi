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