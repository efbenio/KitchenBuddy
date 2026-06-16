// Pure helper functions and shared constants for ingredient data.
// All functions here are stateless — same inputs always return same outputs with no side effects.

import { Category, ConfectionType, Ingredient, RipenessStatus, StorageLocation } from '../types'
import { Colors } from '../theme'

// Shared option lists imported by both the form and the browse filter (no duplication)
export const CATEGORIES: Category[] = ['fruit', 'vegetable', 'dairy', 'fish', 'meat', 'liquid', 'other']
export const LOCATIONS: StorageLocation[] = ['fridge', 'freezer', 'pantry']
export const CONFECTION_TYPES: ConfectionType[] = ['fresh', 'canned', 'frozen', 'cured']
export const RIPENESS_STATUSES: RipenessStatus[] = ['green', 'ripe', 'advanced', 'too_ripe']

export const SIX_MONTHS_DAYS = 180

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

// Returns a date that is N days from today
export const addDays = (days: number): Date => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

// If the current expiry is sooner than minDays from now, push it forward to minDays
export const extendExpiryToAtLeast = (current: Date | undefined, minDays: number): Date => {
  const minDate = addDays(minDays)
  return !current || current < minDate ? minDate : current
}

// Unique id made from the current timestamp and a random suffix
export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const formatDate = (iso: string): string => new Date(iso).toLocaleDateString()

// True when the ingredient is missing any of the four key fields
export const hasMissingData = (i: Ingredient): boolean =>
  !i.category || !i.location || !i.confectionType || !i.expirationDate

export const daysUntilExpiry = (isoDate: string): number =>
  Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

// True when a fresh item's ripeness has not been checked in the last 3 days
export const needsRipenessCheck = (i: Ingredient): boolean => {
  if (!i.ripeness) return false
  if (!i.ripenessCheckedAt) return true
  return Date.now() - new Date(i.ripenessCheckedAt).getTime() > THREE_DAYS_MS
}

const isWithinWindow = (isoDate: string | undefined, cutoff: Date): boolean =>
  !!isoDate && new Date(isoDate) <= cutoff

// Frozen items only show if their expiry is near; non-green and open items always show
export const isExpiringSoon = (i: Ingredient, cutoff: Date): boolean => {
  if (i.isFrozen) return isWithinWindow(i.expirationDate, cutoff)
  if (i.ripeness && i.ripeness !== 'green') return true
  if (i.isOpen) return true
  return isWithinWindow(i.expirationDate, cutoff)
}

// Sort by closest expiry date first; items without a date go to the bottom
export const compareExpiry = (a: Ingredient, b: Ingredient): number => {
  if (!a.expirationDate && !b.expirationDate) return 0
  if (!a.expirationDate) return 1
  if (!b.expirationDate) return -1
  return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
}

// Color for each ripeness level, from fine (green) to too late (dark red)
export const RIPENESS_COLORS: Record<RipenessStatus, string> = {
  green: Colors.success,
  ripe: Colors.warning,
  advanced: Colors.warningDeep,
  too_ripe: Colors.ripenessTooRipe,
}

// Returns a border color that shows how urgent the item is
export const getUrgencyColor = (item: Ingredient): string | undefined => {
  if (!item.expirationDate) {
    if (item.ripeness && item.ripeness !== 'green') return RIPENESS_COLORS[item.ripeness]
    if (item.isOpen) return Colors.warningLight
    return undefined
  }
  const days = daysUntilExpiry(item.expirationDate)
  if (days <= 0) return Colors.dangerDark
  if (days <= 2) return Colors.danger
  if (days <= 5) return Colors.warning
  if (days <= 7) return Colors.warningLight
  return Colors.success
}
