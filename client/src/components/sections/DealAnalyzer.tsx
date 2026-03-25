import { useEffect, useMemo, useRef, useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { GlowBadge } from '../ui/GlowBadge'
import { useMacroData } from '@/hooks/useMarketData'
import { useDealStore } from '@/stores/dealStore'
import {
  calculateDeal, maxOfferByCapRate, maxOfferByCoC,
  calculateSFR, sfrMaxOfferByCapRate, sfrMaxOfferByCoC, estimateRentFromFMR,
} from '@/lib/dealCalculator'
import { api } from '@/lib/api'
import type { DealTab, DealResults, SFRResults } from '@/types'

// --- Formatters ---
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtFull = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtNum = new Intl.NumberFormat('en-US')

// --- Styles ---
const inputClass = 'w-full h-10 bg-void border border-green/20 rounded px-3 text-sm text-chrome focus:border-green/50 outline-none'
const labelClass = 'text-[10px] text-chrome/50 uppercase tracking-wider mb-1 block'
const btnClass = 'bg-green/10 border border-green/30 rounded px-4 py-2.5 text-xs font-bold text-green uppercase tracking-wider active:bg-green/20 transition-colors'

// --- Sub-components ---

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {hint && <span className="text-chrome/30 normal-case tracking-normal ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Stat({ label, value, color = 'text-chrome', sub }: {
  label: string; value: string; color?: string; sub?: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[10px] text-chrome/40 uppercase tracking-wider">{label}</div>
      <div className={`text-base font-bold ${color}`}>{value}</div>
      {sub}
    </div>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const format = (n: number) => n ? fmtNum.format(n) : ''
  const [display, setDisplay] = useState(format(value))
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setDisplay(format(value))
  }, [value])

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder=" "
      value={display}
      onFocus={() => { focused.current = true }}
      onBlur={() => { focused.current = false; setDisplay(format(value)) }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '')
        const num = parseInt(raw) || 0
        setDisplay(num ? fmtNum.format(num) : '')
        onChange(num)
      }}
      className={inputClass}
    />
  )
}

function NumInput({ value, onChange, mode = 'numeric' }: {
  value: number; onChange: (v: number) => void; mode?: 'numeric' | 'decimal'
}) {
  const [local, setLocal] = useState(value ? String(value) : '')
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setLocal(value ? String(value) : '')
  }, [value])

  return (
    <input
      type="text"
      inputMode={mode}
      placeholder=" "
      value={local}
      onFocus={() => { focused.current = true }}
      onBlur={() => { focused.current = false; setLocal(value ? String(value) : '') }}
      onChange={(e) => {
        const raw = mode === 'decimal'
          ? e.target.value.replace(/[^0-9.]/g, '')
          : e.target.value.replace(/[^0-9]/g, '')
        setLocal(raw)
        const num = parseFloat(raw) || 0
        onChange(num)
      }}
      className={inputClass}
    />
  )
}

function Divider() {
  return <div className="border-t border-green/10 my-4" />
}

function TabSwitcher({ active, onChange }: { active: DealTab; onChange: (t: DealTab) => void }) {
  const tabs: { key: DealTab; label: string }[] = [
    { key: 'multifamily', label: 'Multifamily' },
    { key: 'sfr', label: 'Single Family' },
  ]
  return (
    <div className="flex rounded border border-green/20 overflow-hidden mb-4">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            active === t.key
              ? 'bg-green/15 text-green border-green/30'
              : 'bg-void text-chrome/30 active:text-chrome/50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export function DealAnalyzer() {
  const { data: macroData } = useMacroData()
  const store = useDealStore()
  const { activeTab, inputs, sfrInputs, address, areaData, targetCapRate, targetCoC, savedDeals } = store

  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [stressTest, setStressTest] = useState(false)

  const autoRate = (macroData?.treasury10Y ?? 4.0) + 2.5

  // Auto-fill interest rate for MF
  useEffect(() => {
    if (inputs.interestRateOverride === null && macroData) {
      store.updateInputs({ interestRateOverride: Math.round(autoRate * 10) / 10 })
    }
  }, [macroData])

  // Auto-fill interest rate for SFR
  useEffect(() => {
    if (sfrInputs.interestRateOverride === null && macroData) {
      store.updateSFRInputs({ interestRateOverride: Math.round(autoRate * 10) / 10 })
    }
  }, [macroData])

  // Auto-fill SFR rent from FMR when area data loads
  useEffect(() => {
    if (activeTab === 'sfr' && areaData?.fmr && !sfrInputs.monthlyRent) {
      const estimated = estimateRentFromFMR(sfrInputs.beds, areaData.fmr)
      if (estimated) store.updateSFRInputs({ monthlyRent: estimated })
    }
  }, [areaData, activeTab])

  const mfEffectiveRate = inputs.interestRateOverride ?? autoRate
  const sfrEffectiveRate = sfrInputs.interestRateOverride ?? autoRate

  const mfResults = useMemo(() => {
    if (inputs.units <= 0 || inputs.purchasePrice <= 0 || inputs.avgRentPerUnit <= 0) return null
    return calculateDeal(inputs, mfEffectiveRate, stressTest)
  }, [inputs, mfEffectiveRate, stressTest])

  const sfrResults = useMemo(() => {
    if (sfrInputs.purchasePrice <= 0 || !sfrInputs.monthlyRent || sfrInputs.monthlyRent <= 0) return null
    return calculateSFR(sfrInputs, sfrEffectiveRate, stressTest)
  }, [sfrInputs, sfrEffectiveRate, stressTest])

  const results = activeTab === 'multifamily' ? mfResults : sfrResults
  const effectiveRate = activeTab === 'multifamily' ? mfEffectiveRate : sfrEffectiveRate

  const maxCapPrice = useMemo(() => {
    if (!results || targetCapRate <= 0) return null
    return activeTab === 'multifamily'
      ? maxOfferByCapRate(results.noi, targetCapRate / 100)
      : sfrMaxOfferByCapRate(results.noi, targetCapRate / 100)
  }, [results, targetCapRate, activeTab])

  const maxCoCPrice = useMemo(() => {
    if (!results || targetCoC <= 0) return null
    return activeTab === 'multifamily'
      ? maxOfferByCoC(inputs, mfEffectiveRate, targetCoC / 100)
      : sfrMaxOfferByCoC(sfrInputs, sfrEffectiveRate, targetCoC / 100)
  }, [inputs, sfrInputs, mfEffectiveRate, sfrEffectiveRate, targetCoC, results, activeTab])

  async function handleLookup() {
    if (!address.trim() || address.trim().length < 5) return
    setLookupLoading(true)
    setLookupError('')
    try {
      const data = await api.dealLookup(address.trim())
      store.setAreaData(data)
      const stateAbbr = data.geo.stateAbbr
      if (stateAbbr) {
        store.updateInputs({ location: stateAbbr })
        store.updateSFRInputs({ location: stateAbbr })
      }
    } catch {
      setLookupError('Address not found')
      store.setAreaData(null)
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <SectionCard title="Deal Analyzer" accent="green">

      {/* ── Tabs ── */}
      <TabSwitcher active={activeTab} onChange={store.setActiveTab} />

      {/* ── Address Lookup ── */}
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => store.setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Enter property address..."
          className={`${inputClass} flex-1`}
        />
        <button
          onClick={handleLookup}
          disabled={lookupLoading}
          className={`${btnClass} shrink-0 ${lookupLoading ? 'opacity-50' : ''}`}
        >
          {lookupLoading ? '...' : 'Look Up'}
        </button>
      </div>

      {lookupError && (
        <p className="text-[10px] text-magenta mt-1">{lookupError}</p>
      )}

      {/* ── Area Context ── */}
      {areaData && (
        <div className="mt-3 rounded border border-green/10 bg-green/[0.03] px-3 py-2.5">
          <div className="text-[10px] text-green/60 uppercase tracking-wider mb-2">
            {areaData.geo.stateAbbr} &middot; {areaData.geo.zip}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {areaData.census?.medianIncome && (
              <div>
                <div className="text-chrome/40 text-[9px] uppercase">Med. Income</div>
                <div className="text-chrome font-bold">{fmt.format(areaData.census.medianIncome)}</div>
              </div>
            )}
            {areaData.census?.medianRent && (
              <div>
                <div className="text-chrome/40 text-[9px] uppercase">Med. Rent</div>
                <div className="text-chrome font-bold">{fmt.format(areaData.census.medianRent)}/mo</div>
              </div>
            )}
            {areaData.census?.population && (
              <div>
                <div className="text-chrome/40 text-[9px] uppercase">Population</div>
                <div className="text-chrome font-bold">{fmtNum.format(areaData.census.population)}</div>
              </div>
            )}
          </div>
          {areaData.fmr && (
            <div className="mt-2 pt-2 border-t border-green/10">
              <div className="text-chrome/40 text-[9px] uppercase mb-1">HUD Fair Market Rents</div>
              <div className="flex gap-3 text-[10px] text-chrome/70 overflow-x-auto">
                <span>Studio <b className="text-chrome">${areaData.fmr.studio}</b></span>
                <span>1BR <b className="text-chrome">${areaData.fmr.oneBr}</b></span>
                <span>2BR <b className="text-chrome">${areaData.fmr.twoBr}</b></span>
                <span>3BR <b className="text-chrome">${areaData.fmr.threeBr}</b></span>
                <span>4BR <b className="text-chrome">${areaData.fmr.fourBr}</b></span>
              </div>
            </div>
          )}
        </div>
      )}

      <Divider />

      {/* ── Multifamily Inputs ── */}
      {activeTab === 'multifamily' && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <Field label="Units">
            <NumInput value={inputs.units} onChange={(v) => store.updateInputs({ units: v })} />
          </Field>

          <Field label="Purchase Price">
            <MoneyInput value={inputs.purchasePrice} onChange={(v) => store.updateInputs({ purchasePrice: v })} />
          </Field>

          <Field label="Rent / Unit / Mo">
            <NumInput value={inputs.avgRentPerUnit} onChange={(v) => store.updateInputs({ avgRentPerUnit: v })} />
          </Field>

          <Field label="Location" hint={areaData ? '(auto)' : ''}>
            <select value={inputs.location} onChange={(e) => store.updateInputs({ location: e.target.value })} className={inputClass}>
              <option value="">Any</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Down %">
            <NumInput value={inputs.downPaymentPercent} onChange={(v) => store.updateInputs({ downPaymentPercent: v })} />
          </Field>

          <Field label="Loan Term">
            <select value={inputs.loanTermYears} onChange={(e) => store.updateInputs({ loanTermYears: parseInt(e.target.value) })} className={inputClass}>
              {[15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} yr</option>)}
            </select>
          </Field>

          <div className="col-span-2">
            <Field label="Interest Rate %">
              <NumInput value={inputs.interestRateOverride ?? 0} onChange={(v) => store.updateInputs({ interestRateOverride: v || null })} mode="decimal" />
            </Field>
          </div>
        </div>
      )}

      {/* ── SFR Inputs ── */}
      {activeTab === 'sfr' && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <Field label="Bedrooms">
            <select value={sfrInputs.beds} onChange={(e) => store.updateSFRInputs({ beds: parseInt(e.target.value) })} className={inputClass}>
              {[1, 2, 3, 4, 5].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Bathrooms">
            <select value={sfrInputs.baths} onChange={(e) => store.updateSFRInputs({ baths: parseFloat(e.target.value) })} className={inputClass}>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Location" hint={areaData ? '(auto)' : ''}>
            <select value={sfrInputs.location} onChange={(e) => store.updateSFRInputs({ location: e.target.value })} className={inputClass}>
              <option value="">Any</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Monthly Rent" hint={areaData?.fmr ? '(FMR est.)' : ''}>
            <NumInput value={sfrInputs.monthlyRent ?? 0} onChange={(v) => store.updateSFRInputs({ monthlyRent: v || null })} />
          </Field>

          <div className="col-span-2">
            <Field label="Purchase Price">
              <MoneyInput value={sfrInputs.purchasePrice} onChange={(v) => store.updateSFRInputs({ purchasePrice: v })} />
            </Field>
          </div>

          <Field label="Down %">
            <NumInput value={sfrInputs.downPaymentPercent} onChange={(v) => store.updateSFRInputs({ downPaymentPercent: v })} />
          </Field>

          <Field label="Loan Term">
            <select value={sfrInputs.loanTermYears} onChange={(e) => store.updateSFRInputs({ loanTermYears: parseInt(e.target.value) })} className={inputClass}>
              {[15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} yr</option>)}
            </select>
          </Field>

          <div className="col-span-2">
            <Field label="Interest Rate %">
              <NumInput value={sfrInputs.interestRateOverride ?? 0} onChange={(v) => store.updateSFRInputs({ interestRateOverride: v || null })} mode="decimal" />
            </Field>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 mt-3">
        {results && (
          <button onClick={() => store.saveDeal(results)} className={btnClass}>
            Save Deal
          </button>
        )}
        <button onClick={store.reset} className="text-[10px] text-chrome/30 uppercase tracking-wider active:text-magenta">
          Clear
        </button>
        {savedDeals.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-[10px] text-green/50 uppercase tracking-wider active:text-green ml-auto"
          >
            Saved ({savedDeals.length})
          </button>
        )}
      </div>

      {/* ── Stress Test Toggle ── */}
      {results && (
        <button
          onClick={() => setStressTest(!stressTest)}
          className={`mt-3 w-full flex items-center justify-between rounded border px-3 py-2 text-xs transition-colors ${
            stressTest
              ? 'border-magenta/40 bg-magenta/10 text-magenta'
              : 'border-chrome/10 bg-void text-chrome/40 active:border-chrome/20'
          }`}
        >
          <span className="uppercase tracking-wider text-[10px] font-bold">
            Stress Test {stressTest ? 'ON' : 'OFF'}
          </span>
          <span className="text-[10px] opacity-60">
            -10% rent, +10% expenses
          </span>
        </button>
      )}

      {/* ── Results ── */}
      {results && (
        <>
          <Divider />
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Stat
              label="Cap Rate"
              value={`${(results.capRate * 100).toFixed(2)}%`}
              color={results.capRate >= 0.06 ? 'text-green' : 'text-magenta'}
              sub={
                <GlowBadge variant={
                  activeTab === 'multifamily'
                    ? ((results as DealResults).dealQuality === 'Strong' ? 'bullish' : (results as DealResults).dealQuality === 'Decent' ? 'neutral' : 'bearish')
                    : ((results as SFRResults).dealQuality === 'Healthy Cash Flow' ? 'bullish' : (results as SFRResults).dealQuality === 'Thin Margin' ? 'neutral' : 'bearish')
                }>
                  {results.dealQuality}
                </GlowBadge>
              }
            />
            <Stat
              label="Cash-on-Cash"
              value={`${(results.cashOnCash * 100).toFixed(2)}%`}
              color={results.cashOnCash >= 0 ? 'text-green' : 'text-magenta'}
            />
            <Stat
              label="Monthly Cash Flow"
              value={fmtFull.format(results.monthlyCashFlow)}
              color={results.monthlyCashFlow >= 0 ? 'text-green' : 'text-magenta'}
            />
            <Stat
              label="Annual Cash Flow"
              value={fmt.format(results.annualCashFlow)}
              color={results.annualCashFlow >= 0 ? 'text-green' : 'text-magenta'}
            />
            <Stat label="NOI" value={fmt.format(results.noi)} />
            <Stat
              label="Expense Ratio"
              value={`${(results.expenseRatio * 100).toFixed(1)}%`}
              color={results.expenseRatio > 0.5 ? 'text-magenta' : 'text-chrome'}
            />
            <Stat label="Debt Service / Mo" value={fmtFull.format(results.monthlyPayment)} />
            <Stat label="Cash Invested" value={fmt.format(results.cashInvested)} />
          </div>

          {results.flags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {results.flags.map((f) => <GlowBadge key={f} variant="alert">{f}</GlowBadge>)}
            </div>
          )}

          {/* ── Max Offer ── */}
          <Divider />
          <div className="text-[10px] text-chrome/50 uppercase tracking-wider mb-3">Max Offer Price</div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-chrome/40 w-16 shrink-0">Cap Rate</span>
              <input
                type="number" min={1} max={20} step={0.5}
                value={targetCapRate || ''}
                onChange={(e) => store.setTargetCapRate(parseFloat(e.target.value) || 0)}
                className="w-14 h-8 bg-void border border-green/20 rounded px-2 text-xs text-chrome text-center focus:border-green/50 outline-none"
                inputMode="decimal"
              />
              <span className="text-[10px] text-chrome/30">%</span>
              <span className="text-chrome/15 mx-0.5">=</span>
              <span className="text-sm font-bold text-green flex-1 text-right">
                {maxCapPrice && maxCapPrice > 0 ? fmt.format(maxCapPrice) : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-chrome/40 w-16 shrink-0">CoC Return</span>
              <input
                type="number" min={1} max={30} step={0.5}
                value={targetCoC || ''}
                onChange={(e) => store.setTargetCoC(parseFloat(e.target.value) || 0)}
                className="w-14 h-8 bg-void border border-green/20 rounded px-2 text-xs text-chrome text-center focus:border-green/50 outline-none"
                inputMode="decimal"
              />
              <span className="text-[10px] text-chrome/30">%</span>
              <span className="text-chrome/15 mx-0.5">=</span>
              <span className="text-sm font-bold text-green flex-1 text-right">
                {maxCoCPrice && maxCoCPrice > 0 ? fmt.format(maxCoCPrice) : '—'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── Saved Deals ── */}
      {showSaved && savedDeals.length > 0 && (
        <>
          <Divider />
          <div className="text-[10px] text-chrome/50 uppercase tracking-wider mb-2">Saved Deals</div>
          <div className="space-y-2">
            {savedDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start gap-2 rounded border border-green/10 bg-green/[0.02] px-3 py-2"
              >
                <button
                  onClick={() => { store.loadDeal(deal); setShowSaved(false) }}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-xs text-chrome truncate">
                    {deal.address}
                    {deal.type === 'sfr' && <span className="text-chrome/30 ml-1.5">SFR</span>}
                    {(deal.type === 'multifamily' || !deal.type) && <span className="text-chrome/30 ml-1.5">MF</span>}
                  </div>
                  <div className="flex gap-3 mt-0.5 text-[10px] text-chrome/50">
                    <span>Cap {(deal.results.capRate * 100).toFixed(1)}%</span>
                    <span>CoC {(deal.results.cashOnCash * 100).toFixed(1)}%</span>
                    <span>{fmt.format(deal.results.monthlyCashFlow)}/mo</span>
                  </div>
                </button>
                <button
                  onClick={() => store.removeDeal(deal.id)}
                  className="text-chrome/20 active:text-magenta text-xs shrink-0 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  )
}
