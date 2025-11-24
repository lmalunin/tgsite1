export type ClientConfig = {
  backend?: string;
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
      const raw = JSON.parse(decoded) as ClientConfig | string;
      if (typeof raw === "string") {
        return { backend: raw };
      }
      if (typeof raw?.backend === "string") {
        return { backend: raw.backend };
      }
      if ("b" in (raw as Record<string, unknown>)) {
        const backendValue = (raw as Record<string, unknown>).b;
        if (typeof backendValue === "string") {
          return { backend: backendValue };
        }
      }
    } catch {
      return { backend: decoded };
    }
  } catch (error) {
    console.warn("[start_param] Failed to decode payload", error);
  }

  return {};
}

