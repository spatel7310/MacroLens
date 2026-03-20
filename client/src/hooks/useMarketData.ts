import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { REFETCH_INTERVALS } from '@/lib/constants'

export function useMacroData() {
  return useQuery({
    queryKey: ['macro'],
    queryFn: api.macro,
    refetchInterval: REFETCH_INTERVALS.macro,
  })
}

export function useFedData() {
  return useQuery({
    queryKey: ['fed'],
    queryFn: api.fed,
    refetchInterval: REFETCH_INTERVALS.fed,
  })
}

export function useMarketData() {
  return useQuery({
    queryKey: ['market'],
    queryFn: api.market,
    refetchInterval: REFETCH_INTERVALS.market,
  })
}

export function useRealEstateData() {
  return useQuery({
    queryKey: ['real-estate'],
    queryFn: api.realEstate,
    refetchInterval: REFETCH_INTERVALS.realEstate,
  })
}

export function useCalendarData() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: api.calendar,
    refetchInterval: REFETCH_INTERVALS.calendar,
  })
}

export function useNewsData() {
  return useQuery({
    queryKey: ['news'],
    queryFn: api.news,
    refetchInterval: REFETCH_INTERVALS.news,
  })
}
