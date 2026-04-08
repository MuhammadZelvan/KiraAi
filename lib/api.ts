const API_URL = "http://localhost:4000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Login failed");
  }

  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function sendChat(
  message: string,
  conversationId?: string | null,
) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Chat failed");
  }

  return res.json(); // { reply, conversationId }
}

export async function streamChat(
  message: string,
  conversationId: string | null,
  onChunk: (chunk: string) => void,
  onMeta?: (meta: any) => void,
  onDone?: () => void,
  modelId?: string,
  imageBase64?: string,
) {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, conversationId, modelId, imageBase64 }),
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Stream failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const lines = event.split("\n");

      let eventType = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.replace("event: ", "").trim();
        }
        if (line.startsWith("data: ")) {
          data = line.replace("data: ", "");
        }
      }

      if (eventType === "meta") {
        try { onMeta?.(JSON.parse(data)); } catch {}
      } else if (eventType === "message") {
        try {
          const parsed = JSON.parse(data);
          if (parsed.token) onChunk(parsed.token);
        } catch {
          onChunk(data);
        }
      } else if (eventType === "done") {
        onDone?.();
      }
    }
  }
}

export async function getChatHistory(conversationId: string) {
  const res = await fetch(
    `${API_URL}/chat/history?conversationId=${conversationId}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to load history");
  }

  return res.json();
}

export async function deleteConversation(id: string) {
  const res = await fetch(`http://localhost:4000/chat/conversations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete conversation");
  }

  return res.json();
}

export async function archiveConversation(id: string) {
  const res = await fetch(
    `http://localhost:4000/chat/conversations/${id}/archive`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Archive failed");

  return res.json();
}

export async function unarchiveConversation(id: string) {
  const res = await fetch(
    `http://localhost:4000/chat/conversations/${id}/unarchive`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Unarchive failed");

  return res.json();
}

export async function getSettings() {
  const res = await fetch("http://localhost:4000/settings", {
    credentials: "include",
  });

  if (!res.ok) return null;

  return res.json();
}

export async function saveSettings(data: any) {
  const res = await fetch("http://localhost:4000/settings", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save settings");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch("http://localhost:4000/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
}

export async function getQuotaUsage() {
  const res = await fetch(`${API_URL}/chat/quota`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getChatModels() {
  const res = await fetch(`${API_URL}/chat/models`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function deleteMessage(messageId: string) {
  const res = await fetch(`${API_URL}/chat/messages/${messageId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete message");
  return res.json();
}

export async function rewindMessage(messageId: string) {
  const res = await fetch(`${API_URL}/chat/messages/${messageId}/rewind`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to rewind message");
  return res.json() as Promise<{ status: string; content: string; image_url: string | null }>;
}