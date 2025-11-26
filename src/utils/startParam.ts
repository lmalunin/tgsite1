export type ClientConfig = {
  backend?: string;
  chatId?: number;
};

const BASE64_URL_PATTERN = /-/g;
const BASE64_URL_SLASH_PATTERN = /_/g;

function decodeBase64Url(value: string): string {
  const normalized = value
    .replace(BASE64_URL_PATTERN, "+")
    .replace(BASE64_URL_SLASH_PATTERN, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(paddingLength);
  return atob(padded);
}

export function decodeStartParam(value?: string | null): ClientConfig {
  if (!value) {
    return {};
  }

  try {
    const decoded = decodeBase64Url(value);

    try {
      const raw = JSON.parse(decoded) as ClientConfig | string | any;

      // Если это строка - используем как backend
      if (typeof raw === "string") {
        return { backend: raw };
      }

      // Если это объект с полем backend
      if (typeof raw?.backend === "string") {
        return {
          backend: raw.backend,
          chatId: raw.chatId || raw.c, // поддерживаем оба формата
        };
      }

      // Если это объект с полем b (сокращенный формат)
      if ("b" in raw) {
        return {
          backend: raw.b,
          chatId: raw.chatId || raw.c,
        };
      }

      // Пытаемся извлечь chatId из других полей
      if (raw.chatId || raw.c) {
        return {
          chatId: raw.chatId || raw.c,
        };
      }
    } catch {
      // Если не JSON, используем как backend URL
      return { backend: decoded };
    }
  } catch (error) {
    console.warn("[start_param] Failed to decode payload", error);
  }

  return {};
}
