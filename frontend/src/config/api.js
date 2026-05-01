const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const isLoopbackUrl = (value = "") =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);

export const API_URL =
  import.meta.env.PROD && (!configuredApiUrl || isLoopbackUrl(configuredApiUrl))
    ? window.location.origin
    : configuredApiUrl || (import.meta.env.DEV ? "http://localhost:8000" : window.location.origin);
