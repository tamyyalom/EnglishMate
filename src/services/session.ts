const SESSION_KEY = "englishmate_session";
const LEVEL_KEY = "englishmate_level";

/** Mock session flag stored in localStorage after login. */
export function setSessionActive(): void {
  localStorage.setItem(SESSION_KEY, "1");
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isSessionActive(): boolean {
  return localStorage.getItem(SESSION_KEY) === "1";
}

export function getStoredLevel(): string {
  return localStorage.getItem(LEVEL_KEY) ?? "B1";
}

export function setStoredLevel(level: string): void {
  localStorage.setItem(LEVEL_KEY, level);
}
