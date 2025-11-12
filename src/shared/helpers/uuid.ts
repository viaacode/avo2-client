export function isUuid(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/g.test(
    id,
  )
}

export function generateRandomId(): string {
  return Math.random().toString().substring(2, 15)
}
