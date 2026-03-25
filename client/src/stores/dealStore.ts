import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DealInputs, DealResults, SFRInputs, SFRResults, AreaLookup, SavedDeal, DealTab } from '@/types'

const DEFAULT_MF_INPUTS: DealInputs = {
  units: 0,
  purchasePrice: 500000,
  avgRentPerUnit: 800,
  location: '',
  downPaymentPercent: 30,
  loanTermYears: 15,
  interestRateOverride: null,
}

const DEFAULT_SFR_INPUTS: SFRInputs = {
  beds: 3,
  baths: 2,
  monthlyRent: null,
  purchasePrice: 250000,
  location: '',
  downPaymentPercent: 20,
  loanTermYears: 30,
  interestRateOverride: null,
}

interface DealState {
  activeTab: DealTab
  inputs: DealInputs
  sfrInputs: SFRInputs
  address: string
  areaData: AreaLookup | null
  targetCapRate: number
  targetCoC: number
  savedDeals: SavedDeal[]
  setActiveTab: (tab: DealTab) => void
  updateInputs: (partial: Partial<DealInputs>) => void
  updateSFRInputs: (partial: Partial<SFRInputs>) => void
  setAddress: (v: string) => void
  setAreaData: (v: AreaLookup | null) => void
  setTargetCapRate: (v: number) => void
  setTargetCoC: (v: number) => void
  saveDeal: (results: DealResults | SFRResults) => void
  removeDeal: (id: string) => void
  loadDeal: (deal: SavedDeal) => void
  reset: () => void
}

export const useDealStore = create<DealState>()(
  persist(
    (set, get) => ({
      activeTab: 'multifamily',
      inputs: DEFAULT_MF_INPUTS,
      sfrInputs: DEFAULT_SFR_INPUTS,
      address: '',
      areaData: null,
      targetCapRate: 8,
      targetCoC: 10,
      savedDeals: [],
      setActiveTab: (tab) => set({ activeTab: tab }),
      updateInputs: (partial) =>
        set((state) => ({ inputs: { ...state.inputs, ...partial } })),
      updateSFRInputs: (partial) =>
        set((state) => ({ sfrInputs: { ...state.sfrInputs, ...partial } })),
      setAddress: (v) => set({ address: v }),
      setAreaData: (v) => set({ areaData: v }),
      setTargetCapRate: (v) => set({ targetCapRate: v }),
      setTargetCoC: (v) => set({ targetCoC: v }),
      saveDeal: (results) => {
        const { activeTab, address, inputs, sfrInputs, areaData, savedDeals } = get()
        const deal: SavedDeal = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          address: address || 'Untitled Deal',
          type: activeTab,
          inputs: activeTab === 'multifamily' ? { ...inputs } : { ...sfrInputs },
          results: { ...results },
          areaData,
          savedAt: Date.now(),
        }
        set({ savedDeals: [deal, ...savedDeals].slice(0, 20) })
      },
      removeDeal: (id) =>
        set((state) => ({ savedDeals: state.savedDeals.filter((d) => d.id !== id) })),
      loadDeal: (deal) => {
        const update: Partial<DealState> = {
          address: deal.address,
          areaData: deal.areaData,
          activeTab: deal.type ?? 'multifamily',
        }
        if (deal.type === 'sfr') {
          update.sfrInputs = { ...(deal.inputs as SFRInputs) }
        } else {
          update.inputs = { ...(deal.inputs as DealInputs) }
        }
        set(update as DealState)
      },
      reset: () => {
        const { activeTab } = get()
        set({
          ...(activeTab === 'multifamily'
            ? { inputs: DEFAULT_MF_INPUTS }
            : { sfrInputs: DEFAULT_SFR_INPUTS }),
          address: '',
          areaData: null,
          targetCapRate: 8,
          targetCoC: 10,
        })
      },
    }),
    { name: 'MacroLens-deal' }
  )
)
