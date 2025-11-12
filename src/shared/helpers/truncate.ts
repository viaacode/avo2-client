export function truncateTableValue(value: string | null | undefined) {
  return (value || '-').slice(0, 60)
}
