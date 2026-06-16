// Handles reading and writing the ingredient list to AsyncStorage.
// Returns an empty array if loading fails; throws if saving fails so the context can surface the error.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ingredient } from './types'

const KEY = '@kitchen_buddy/ingredients'

export const loadIngredients = async (): Promise<Ingredient[]> => {
  try {
    const json = await AsyncStorage.getItem(KEY)
    return json ? (JSON.parse(json) as Ingredient[]) : []
  } catch {
    return []
  }
}

export const saveIngredients = async (ingredients: Ingredient[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ingredients))
  } catch {
    throw new Error('Failed to persist ingredients to storage.')
  }
}
