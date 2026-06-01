export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getCurrentTimestamp(): number {
  return Date.now();
}
