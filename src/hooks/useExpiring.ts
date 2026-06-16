// Custom hook for the Expiring Soon screen.
// Handles the day window state and groups items into urgency sections for SectionList.

import { useState } from 'react'
import { Ingredient } from '../types'
import { isExpiringSoon, compareExpiry, daysUntilExpiry } from '../utils/ingredients'
import { useIngredients } from '../context'

export interface ExpiringSection {
  title: string
  data: Ingredient[]
}

// Split a flat sorted list into named urgency buckets
const groupByUrgency = (items: Ingredient[]): ExpiringSection[] => {
  const expired: Ingredient[] = []
  const verySoon: Ingredient[] = []
  const thisWeek: Ingredient[] = []
  const attention: Ingredient[] = []

  items.forEach(item => {
    if (!item.expirationDate) {
      attention.push(item)
      return
    }
    const d = daysUntilExpiry(item.expirationDate)
    if (d <= 0) expired.push(item)
    else if (d <= 2) verySoon.push(item)
    else if (d <= 7) thisWeek.push(item)
    else attention.push(item)
  })

  return [
    { title: 'Expired', data: expired },
    { title: 'Today or tomorrow', data: verySoon },
    { title: 'This week', data: thisWeek },
    { title: 'Needs attention', data: attention },
  ].filter(s => s.data.length > 0)
}

export const useExpiring = () => {
  const { ingredients, loading, error } = useIngredients()
  const [days, setDays] = useState('7')

  const daysNum = Math.max(1, parseInt(days, 10) || 7)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + daysNum)

  const filtered = [...ingredients].filter(i => isExpiringSoon(i, cutoff)).sort(compareExpiry)
  const sections = groupByUrgency(filtered)

  return { days, setDays, sections, loading, error }
}
