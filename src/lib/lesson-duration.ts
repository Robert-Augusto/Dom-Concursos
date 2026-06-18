export function formatLessonDuration(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return '—'

  const trimmed = String(value).trim()
  return trimmed || '—'
}
