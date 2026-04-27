export type FeeBand = {
  min: number
  max: number
  fee: number
}

export const PAYWALL_FEE_BANDS: FeeBand[] = [
  { min: 1, max: 49, fee: 1 },
  { min: 50, max: 499, fee: 6 },
  { min: 500, max: 999, fee: 10 },
  { min: 1000, max: 1499, fee: 15 },
  { min: 1500, max: 2499, fee: 20 },
  { min: 2500, max: 3499, fee: 25 },
  { min: 3500, max: 4999, fee: 30 },
  { min: 5000, max: 7499, fee: 40 },
  { min: 7500, max: 9999, fee: 45 },
  { min: 10000, max: 14999, fee: 50 },
  { min: 15000, max: 19999, fee: 55 },
  { min: 20000, max: 34999, fee: 80 },
  { min: 35000, max: 49999, fee: 105 },
  { min: 50000, max: 149999, fee: 130 },
  { min: 150000, max: 249999, fee: 160 },
  { min: 250000, max: 349999, fee: 195 },
  { min: 350000, max: 549999, fee: 230 },
  { min: 550000, max: 749999, fee: 275 },
  { min: 750000, max: 999999, fee: 320 },
]

export function calculatePaywallFee(amount: number): number {
  if (!Number.isFinite(amount) || amount < 1) return 0

  const roundedAmount = Math.trunc(amount)
  const match = PAYWALL_FEE_BANDS.find((band) => roundedAmount >= band.min && roundedAmount <= band.max)
  return match?.fee ?? PAYWALL_FEE_BANDS[PAYWALL_FEE_BANDS.length - 1].fee
}
