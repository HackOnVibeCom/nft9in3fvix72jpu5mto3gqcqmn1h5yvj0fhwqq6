export function analyticsConversionRate(clicks: number, registrations: number) {
  return clicks > 0 ? (registrations / clicks) * 100 : 0;
}
