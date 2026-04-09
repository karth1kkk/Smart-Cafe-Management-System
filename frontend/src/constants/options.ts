import type { AddOn, MilkType, SizeOption } from '../types/api'

export const SIZE_OPTIONS: SizeOption[] = ['S', 'M', 'L']
export const MILK_OPTIONS: MilkType[] = ['full cream', 'oat', 'almond']
export const ADD_ON_OPTIONS: AddOn[] = ['extra shot', 'syrup']

export const SIZE_PRICE_ADJUSTMENTS: Record<SizeOption, number> = {
  S: 0,
  M: 0.5,
  L: 1,
}

export const ADD_ON_PRICES: Record<AddOn, number> = {
  'extra shot': 1.5,
  syrup: 0.75,
}
