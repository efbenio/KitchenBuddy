// Global state for the whole app: the ingredients list, loading state, and write operations.
// Wrap the app in IngredientsProvider and call useIngredients() in any component that needs it.

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Ingredient } from './types'
import { loadIngredients, saveIngredients } from './storage'

interface ContextType {
  ingredients: Ingredient[]
  loading: boolean
  error: string | null
  addIngredient: (ingredient: Ingredient) => Promise<void>
  updateIngredient: (ingredient: Ingredient) => Promise<void>
  deleteIngredient: (id: string) => Promise<void>
}

const IngredientsContext = createContext<ContextType | null>(null)

export const IngredientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load saved ingredients from storage when the app first opens
  useEffect(() => {
    loadIngredients()
      .then(loaded => {
        setIngredients(loaded)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load your ingredients. Please restart the app.')
        setLoading(false)
      })
  }, [])

  // All writes go through here. Updates in-memory state and persists to disk.
  const persist = async (updated: Ingredient[]): Promise<void> => {
    try {
      setIngredients(updated)
      await saveIngredients(updated)
    } catch {
      setError('Could not save changes. Please try again.')
    }
  }

  // New ingredient goes to the front of the list so it shows up first in Browse
  const addIngredient = async (ingredient: Ingredient): Promise<void> =>
    persist([ingredient, ...ingredients])

  // Replace the old version of an ingredient, keep everything else the same
  const updateIngredient = async (ingredient: Ingredient): Promise<void> =>
    persist(ingredients.map(i => (i.id === ingredient.id ? ingredient : i)))

  // Remove one ingredient by its id
  const deleteIngredient = async (id: string): Promise<void> =>
    persist(ingredients.filter(i => i.id !== id))

  return (
    <IngredientsContext.Provider
      value={{ ingredients, loading, error, addIngredient, updateIngredient, deleteIngredient }}
    >
      {children}
    </IngredientsContext.Provider>
  )
}

export const useIngredients = (): ContextType => {
  return useContext(IngredientsContext)!
}
