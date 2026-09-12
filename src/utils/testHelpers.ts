export function uniqueUsername(prefix = 'autotest'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function longString(length: number): string {
  return 'a'.repeat(length);
}