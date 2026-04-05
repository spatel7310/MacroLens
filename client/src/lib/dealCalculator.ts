import type { DealInputs, DealResults, SFRInputs, SFRResults, AreaLookup, ExpenseOverrides } from '@/types'

// --- Regional assumptions ---

type RegionKey = 'southeast' | 'midwest' | 'northeast_west' | 'default'

interface RegionalAssumptions {
  taxRate: number
  insurancePerUnit: number
  maintenancePct: number
  capexPct: number
}

const REGIONAL_DEFAULTS: Record<RegionKey, RegionalAssumptions> = {
  southeast:      { taxRate: 1.1, insurancePerUnit: 350, maintenancePct: 12, capexPct: 10 },
  midwest:        { taxRate: 1.5, insurancePerUnit: 300, maintenancePct: 13, capexPct: 11 },
  northeast_west: { taxRate: 1.3, insurancePerUnit: 400, maintenancePct: 12, capexPct: 10 },
  default:        { taxRate: 1.2, insurancePerUnit: 325, maintenancePct: 12, capexPct: 10 },
}

const STATE_TO_REGION: Record<string, RegionKey> = {
  NC: 'southeast', SC: 'southeast', GA: 'southeast', FL: 'southeast', TN: 'southeast',
  MI: 'midwest', OH: 'midwest', IN: 'midwest', IL: 'midwest',
  NY: 'northeast_west', CA: 'northeast_west', WA: 'northeast_west', NJ: 'northeast_west', MA: 'northeast_west',
}

// Global conservative assumptions
const VACANCY = 0.10
const UTILITIES = 0.05
const OTHER = 0.03

function getRegion(state: string): RegionalAssumptions {
  const key = STATE_TO_REGION[state] ?? 'default'
  return REGIONAL_DEFAULTS[key]
}

export function getMFExpenseDefaults(state: string): ExpenseOverrides {
  const r = getRegion(state)
  return {
    vacancyPct: VACANCY * 100,
    taxRate: r.taxRate,
    insurancePerUnit: r.insurancePerUnit,
    maintenancePct: r.maintenancePct,
    capexPct: r.capexPct,
    utilitiesPct: UTILITIES * 100,
    otherPct: OTHER * 100,
  }
}

export function getSFRExpenseDefaults(state: string): ExpenseOverrides {
  const r = getSFRRegion(state)
  return {
    vacancyPct: SFR_VACANCY * 100,
    taxRate: r.taxRate,
    insurancePerUnit: r.insuranceAnnual,
    maintenancePct: r.maintenancePct,
    capexPct: r.capexPct,
    otherPct: SFR_OTHER * 100,
  }
}

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

// --- Main calculation ---

export function calculateDeal(inputs: DealInputs, effectiveRate: number, stressTest = false): DealResults {
  const region = getRegion(inputs.location)
  const ov = inputs.expenseOverrides ?? {}

  const rentMultiplier = stressTest ? 0.90 : 1
  const expenseMultiplier = stressTest ? 1.10 : 1

  const vacancyRate = (ov.vacancyPct ?? VACANCY * 100) / 100
  const grossPotentialRent = inputs.units * inputs.avgRentPerUnit * 12 * rentMultiplier
  const effectiveGrossIncome = grossPotentialRent * (1 - vacancyRate)

  const taxes = inputs.purchasePrice * (ov.taxRate ?? region.taxRate) / 100 * expenseMultiplier
  const insurance = (ov.insurancePerUnit ?? region.insurancePerUnit) * inputs.units * expenseMultiplier
  const maintenance = grossPotentialRent * (ov.maintenancePct ?? region.maintenancePct) / 100 * expenseMultiplier
  const capex = grossPotentialRent * (ov.capexPct ?? region.capexPct) / 100 * expenseMultiplier
  const utilities = grossPotentialRent * (ov.utilitiesPct ?? UTILITIES * 100) / 100 * expenseMultiplier
  const other = grossPotentialRent * (ov.otherPct ?? OTHER * 100) / 100 * expenseMultiplier
  const totalOperatingExpenses = taxes + insurance + maintenance + capex + utilities + other

  const noi = effectiveGrossIncome - totalOperatingExpenses
  const capRate = inputs.purchasePrice > 0 ? noi / inputs.purchasePrice : 0

  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent / 100)
  const monthlyPayment = calcMonthlyPayment(loanAmount, effectiveRate, inputs.loanTermYears)
  const annualDebtService = monthlyPayment * 12

  const annualCashFlow = noi - annualDebtService
  const monthlyCashFlow = annualCashFlow / 12

  const cashInvested = inputs.purchasePrice * inputs.downPaymentPercent / 100
  const cashOnCash = cashInvested > 0 ? annualCashFlow / cashInvested : 0

  const expenseRatio = effectiveGrossIncome > 0 ? totalOperatingExpenses / effectiveGrossIncome : 0

  const dealQuality: DealResults['dealQuality'] =
    capRate > 0.08 ? 'Strong' : capRate >= 0.06 ? 'Decent' : 'Tight'

  const flags: string[] = []
  if (annualCashFlow < 0) flags.push('Negative Cash Flow')
  if (expenseRatio > 0.50) flags.push('High Expenses')
  if (effectiveRate > 7) flags.push('High Debt Cost')

  return {
    grossPotentialRent,
    effectiveGrossIncome,
    totalOperatingExpenses,
    noi,
    capRate,
    monthlyPayment,
    annualDebtService,
    annualCashFlow,
    monthlyCashFlow,
    cashInvested,
    cashOnCash,
    expenseRatio,
    dealQuality,
    flags,
  }
}

// --- Max offer price ---

export function maxOfferByCapRate(noi: number, targetCapRate: number): number {
  if (targetCapRate <= 0) return 0
  return noi / targetCapRate
}

// --- SFR regional assumptions ---

interface SFRRegionalAssumptions {
  taxRate: number
  insuranceAnnual: number
  maintenancePct: number
  capexPct: number
}

const SFR_REGIONAL_DEFAULTS: Record<RegionKey, SFRRegionalAssumptions> = {
  southeast:      { taxRate: 1.1, insuranceAnnual: 1200, maintenancePct: 10, capexPct: 8 },
  midwest:        { taxRate: 1.5, insuranceAnnual: 1000, maintenancePct: 11, capexPct: 9 },
  northeast_west: { taxRate: 1.3, insuranceAnnual: 1500, maintenancePct: 10, capexPct: 8 },
  default:        { taxRate: 1.2, insuranceAnnual: 1200, maintenancePct: 10, capexPct: 8 },
}

const SFR_VACANCY = 0.08
const SFR_OTHER = 0.03

function getSFRRegion(state: string): SFRRegionalAssumptions {
  const key = STATE_TO_REGION[state] ?? 'default'
  return SFR_REGIONAL_DEFAULTS[key]
}

export function estimateRentFromFMR(beds: number, fmr: AreaLookup['fmr']): number | null {
  if (!fmr) return null
  const map: Record<number, number> = {
    0: fmr.studio,
    1: fmr.oneBr,
    2: fmr.twoBr,
    3: fmr.threeBr,
    4: fmr.fourBr,
  }
  const base = map[Math.min(beds, 4)] ?? fmr.twoBr
  // Conservative 5% haircut on FMR
  return Math.round(base * 0.95)
}

export function calculateSFR(inputs: SFRInputs, effectiveRate: number, stressTest = false): SFRResults {
  const region = getSFRRegion(inputs.location)
  const ov = inputs.expenseOverrides ?? {}
  const monthlyRent = inputs.monthlyRent ?? 0

  const rentMultiplier = stressTest ? 0.90 : 1
  const expenseMultiplier = stressTest ? 1.10 : 1

  const vacancyRate = (ov.vacancyPct ?? SFR_VACANCY * 100) / 100
  const grossAnnualRent = monthlyRent * 12 * rentMultiplier
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate)

  const taxes = inputs.purchasePrice * (ov.taxRate ?? region.taxRate) / 100 * expenseMultiplier
  const insurance = (ov.insurancePerUnit ?? region.insuranceAnnual) * expenseMultiplier
  const maintenance = grossAnnualRent * (ov.maintenancePct ?? region.maintenancePct) / 100 * expenseMultiplier
  const capex = grossAnnualRent * (ov.capexPct ?? region.capexPct) / 100 * expenseMultiplier
  const other = grossAnnualRent * (ov.otherPct ?? SFR_OTHER * 100) / 100 * expenseMultiplier
  const totalOperatingExpenses = taxes + insurance + maintenance + capex + other

  const noi = effectiveGrossIncome - totalOperatingExpenses
  const capRate = inputs.purchasePrice > 0 ? noi / inputs.purchasePrice : 0

  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent / 100)
  const monthlyPayment = calcMonthlyPayment(loanAmount, effectiveRate, inputs.loanTermYears)
  const annualDebtService = monthlyPayment * 12

  const annualCashFlow = noi - annualDebtService
  const monthlyCashFlow = annualCashFlow / 12

  const cashInvested = inputs.purchasePrice * inputs.downPaymentPercent / 100
  const cashOnCash = cashInvested > 0 ? annualCashFlow / cashInvested : 0

  const expenseRatio = effectiveGrossIncome > 0 ? totalOperatingExpenses / effectiveGrossIncome : 0

  const dealQuality: SFRResults['dealQuality'] =
    monthlyCashFlow < 0 ? 'Negative Cash Flow' : monthlyCashFlow < 200 ? 'Thin Margin' : 'Healthy Cash Flow'

  const flags: string[] = []
  if (annualCashFlow < 0) flags.push('Negative Cash Flow')
  if (expenseRatio > 0.55) flags.push('High Expense Load')
  if (region.taxRate >= 1.5) flags.push('High Tax Market')
  if (effectiveRate > 7) flags.push('High Debt Cost')
  if (!inputs.monthlyRent) flags.push('No Rent Entered')

  return {
    grossAnnualRent,
    effectiveGrossIncome,
    totalOperatingExpenses,
    noi,
    capRate,
    monthlyPayment,
    annualDebtService,
    annualCashFlow,
    monthlyCashFlow,
    cashInvested,
    cashOnCash,
    expenseRatio,
    dealQuality,
    flags,
    rentSource: inputs.monthlyRent ? 'manual' : 'none',
  }
}

export function sfrMaxOfferByCapRate(noi: number, targetCapRate: number): number {
  if (targetCapRate <= 0) return 0
  return noi / targetCapRate
}

export function sfrMaxOfferByCoC(
  inputs: SFRInputs,
  effectiveRate: number,
  targetCoC: number,
): number {
  const region = getSFRRegion(inputs.location)
  const ov = inputs.expenseOverrides ?? {}
  const monthlyRent = inputs.monthlyRent ?? 0
  const grossAnnualRent = monthlyRent * 12
  const vacancyRate = (ov.vacancyPct ?? SFR_VACANCY * 100) / 100
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate)

  const insurance = ov.insurancePerUnit ?? region.insuranceAnnual
  const maintenance = grossAnnualRent * (ov.maintenancePct ?? region.maintenancePct) / 100
  const capex = grossAnnualRent * (ov.capexPct ?? region.capexPct) / 100
  const other = grossAnnualRent * (ov.otherPct ?? SFR_OTHER * 100) / 100
  const noiBase = effectiveGrossIncome - insurance - maintenance - capex - other

  const d = inputs.downPaymentPercent / 100
  const r = effectiveRate / 100 / 12
  const n = inputs.loanTermYears * 12
  const A = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

  const taxRate = (ov.taxRate ?? region.taxRate) / 100
  const denominator = targetCoC * d + taxRate + (1 - d) * 12 * A
  if (denominator <= 0) return 0
  return noiBase / denominator
}

export function maxOfferByCoC(
  inputs: DealInputs,
  effectiveRate: number,
  targetCoC: number,
): number {
  const region = getRegion(inputs.location)
  const ov = inputs.expenseOverrides ?? {}
  const grossPotentialRent = inputs.units * inputs.avgRentPerUnit * 12
  const vacancyRate = (ov.vacancyPct ?? VACANCY * 100) / 100
  const effectiveGrossIncome = grossPotentialRent * (1 - vacancyRate)

  // NOI components that don't depend on price
  const insurance = (ov.insurancePerUnit ?? region.insurancePerUnit) * inputs.units
  const maintenance = grossPotentialRent * (ov.maintenancePct ?? region.maintenancePct) / 100
  const capex = grossPotentialRent * (ov.capexPct ?? region.capexPct) / 100
  const utilities = grossPotentialRent * (ov.utilitiesPct ?? UTILITIES * 100) / 100
  const other = grossPotentialRent * (ov.otherPct ?? OTHER * 100) / 100
  const noiBase = effectiveGrossIncome - insurance - maintenance - capex - utilities - other

  // NOI(P) = noiBase - P * taxRate/100
  // ADS(P) = P * (1-d) * A * 12  where A = monthly annuity factor
  // CoC = (NOI(P) - ADS(P)) / (P * d)
  // Solving: P = noiBase / (targetCoC * d + taxRate/100 + (1-d) * 12 * A)

  const d = inputs.downPaymentPercent / 100
  const r = effectiveRate / 100 / 12
  const n = inputs.loanTermYears * 12
  const A = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

  const taxRate = (ov.taxRate ?? region.taxRate) / 100
  const denominator = targetCoC * d + taxRate + (1 - d) * 12 * A
  if (denominator <= 0) return 0
  return noiBase / denominator
}
