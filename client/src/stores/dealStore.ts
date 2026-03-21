import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DealInputs, DealResults, AreaLookup, SavedDeal } from '@/types'

const DEFAULT_INPUTS: DealInputs = {
  units: 0,
  purchasePrice: 0,
  avgRentPerUnit: 0,
  location: '',
  downPaymentPercent: 25,
  loanTermYears: 30,
  interestRateOverride: null,
}

interface DealState {
  inputs: DealInputs
  address: string
  areaData: AreaLookup | null
  targetCapRate: number
  targetCoC: number
  savedDeals: SavedDeal[]
  updateInputs: (partial: Partial<DealInputs>) => void
  setAddress: (v: string) => void
  setAreaData: (v: AreaLookup | null) => void
  setTargetCapRate: (v: number) => void
  setTargetCoC: (v: number) => void
  saveDeal: (results: DealResults) => void
  removeDeal: (id: string) => void
  loadDeal: (deal: SavedDeal) => void
  reset: () => void
}

export const useDealStore = create<DealState>()(
  persist(
    (set, get) => ({
      inputs: DEFAULT_INPUTS,
      address: '',
      areaData: null,
      targetCapRate: 8,
      targetCoC: 10,
      savedDeals: [],
      updateInputs: (partial) =>
        set((state) => ({ inputs: { ...state.inputs, ...partial } })),
      setAddress: (v) => set({ address: v }),
      setAreaData: (v) => set({ areaData: v }),
      setTargetCapRate: (v) => set({ targetCapRate: v }),
      setTargetCoC: (v) => set({ targetCoC: v }),
      saveDeal: (results) => {
        const { address, inputs, areaData, savedDeals } = get()
        const deal: SavedDeal = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          address: address || 'Untitled Deal',
          inputs: { ...inputs },
          results: { ...results },
          areaData,
          savedAt: Date.now(),
        }
        set({ savedDeals: [deal, ...savedDeals].slice(0, 20) })
      },
      removeDeal: (id) =>
        set((state) => ({ savedDeals: state.savedDeals.filter((d) => d.id !== id) })),
      loadDeal: (deal) =>
        set({
          address: deal.address,
          inputs: { ...deal.inputs },
          areaData: deal.areaData,
        }),
      reset: () => set({
        inputs: DEFAULT_INPUTS,
        address: '',
        areaData: null,
        targetCapRate: 8,
        targetCoC: 10,
      }),
    }),
    { name: 'MacroLens-deal' }
  )
)
