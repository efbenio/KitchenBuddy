// Custom hook for the Browse screen.
// Owns the query type and sub-filter state, and returns the matching ingredient list.

import { useState } from 'react'
import { Category, ConfectionType, Ingredient, StorageLocation } from '../types'
import { hasMissingData, needsRipenessCheck } from '../utils/ingredients'
import { useIngredients } from '../context'

export type QueryType = 'missing' | 'recent' | 'location' | 'category' | 'confection' | 'ripeness_check'

export const QUERY_TABS: { key: QueryType; label: string }[] = [
  { key: 'missing', label: 'Missing data' },
  { key: 'recent', label: 'Recent' },
  { key: 'location', label: 'Location' },
  { key: 'category', label: 'Category' },
  { key: 'confection', label: 'Confection' },
  { key: 'ripeness_check', label: 'Check ripeness' },
]

export const useBrowseFilter = () => {
  const { ingredients, loading, error } = useIngredients()
  const [query, setQuery] = useState<QueryType>('missing')
  const [filterLocation, setFilterLocation] = useState<StorageLocation>('fridge')
  const [filterCategory, setFilterCategory] = useState<Category>('fruit')
  const [filterConfection, setFilterConfection] = useState<ConfectionType>('fresh')

  const getResults = (): Ingredient[] => {
    switch (query) {
      case 'missing':
        return ingredients.filter(hasMissingData)
      case 'recent':
        // Sort newest first and keep only the last 20 added
        return [...ingredients]
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, 20)
      case 'location':
        return ingredients.filter(i => i.location === filterLocation)
      case 'category':
        return ingredients.filter(i => i.category === filterCategory)
      case 'confection':
        return ingredients.filter(i => i.confectionType === filterConfection)
      case 'ripeness_check':
        return ingredients.filter(needsRipenessCheck)
    }
  }

  return {
    query,
    setQuery,
    filterLocation,
    setFilterLocation,
    filterCategory,
    setFilterCategory,
    filterConfection,
    setFilterConfection,
    results: getResults(),
    loading,
    error,
  }
}
