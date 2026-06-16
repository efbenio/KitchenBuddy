// All the shared types used across the app live here.
// Keeping them in one place makes it easy to see the shape of the data.

// What kind of food the ingredient is
export type Category = 'fruit' | 'vegetable' | 'dairy' | 'fish' | 'meat' | 'liquid' | 'other'

// Where in the kitchen the ingredient is stored
export type StorageLocation = 'fridge' | 'freezer' | 'pantry'

// How the ingredient was preserved or processed
export type ConfectionType = 'fresh' | 'canned' | 'frozen' | 'cured'

// How ripe a fresh ingredient currently looks
export type RipenessStatus = 'green' | 'ripe' | 'advanced' | 'too_ripe'

// A full ingredient as stored in the app. Every ingredient has an id and a name.
// Everything else is optional because users might not know all the details right away.
export interface Ingredient {
  id: string
  name: string
  brand?: string
  category?: Category
  location?: StorageLocation
  confectionType?: ConfectionType
  expirationDate?: string      // ISO date string
  addedAt: string              // ISO date string, set when the ingredient is created
  ripeness?: RipenessStatus
  ripenessCheckedAt?: string   // When the user last checked the ripeness
  isFrozen?: boolean           // True if the ingredient is currently in the freezer
  isOpen?: boolean             // True if the package has been opened
  openedAt?: string            // When it was opened, used to estimate freshness
}

// What the form collects when adding or editing an ingredient.
// Same as Ingredient but without id and addedAt since those are set automatically.
export interface IngredientFormData {
  name: string
  brand?: string
  category?: Category
  location?: StorageLocation
  confectionType?: ConfectionType
  expirationDate?: string
  ripeness?: RipenessStatus
  ripenessCheckedAt?: string
  isFrozen?: boolean
  isOpen?: boolean
  openedAt?: string
}

// Navigation types so TypeScript knows what parameters each screen expects
export type RootStackParamList = {
  Tabs: undefined
  Edit: { id: string }     // Edit screen needs to know which ingredient to load
}

export type TabParamList = {
  Add: undefined
  Expiring: undefined
  Browse: undefined
}
