export function extractKlascementError(err: any): string {
  const klascementError =
    err?.innerException?.additionalInfo?.responseBody?.additionalInfo
      ?.klascementError
  return klascementError?.uitzonderingen?.[0]?.diagnose || klascementError
}
