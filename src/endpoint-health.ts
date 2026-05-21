import type { HealthResult } from "./types.js";

export async function checkEndpointHealth(endpoint: string, timeoutMs = 1500): Promise<HealthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
    });

    return {
      online: response.ok || response.status === 405,
      status: response.status,
      error: response.ok || response.status === 405 ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      online: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}
