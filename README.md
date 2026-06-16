# KitchenBuddy

A React Native / Expo app for tracking kitchen ingredients, expiry dates, and freshness.

---

## Data Types

All shared types live in `src/types.ts`.

| Type | Values |
|---|---|
| `Category` | `'fruit'` \| `'vegetable'` \| `'dairy'` \| `'fish'` \| `'meat'` \| `'liquid'` \| `'other'` |
| `StorageLocation` | `'fridge'` \| `'freezer'` \| `'pantry'` |
| `ConfectionType` | `'fresh'` \| `'canned'` \| `'frozen'` \| `'cured'` |
| `RipenessStatus` | `'green'` \| `'ripe'` \| `'advanced'` \| `'too_ripe'` |

### `Ingredient`

| Field | Type | Required |
|---|---|---|
| `id` | `string` | ✓ |
| `name` | `string` | ✓ |
| `addedAt` | `string` (ISO) | ✓ |
| `brand` | `string` | |
| `category` | `Category` | |
| `location` | `StorageLocation` | |
| `confectionType` | `ConfectionType` | |
| `expirationDate` | `string` (ISO) | |
| `ripeness` | `RipenessStatus` | |
| `ripenessCheckedAt` | `string` (ISO) | |
| `isFrozen` | `boolean` | |
| `isOpen` | `boolean` | |
| `openedAt` | `string` (ISO) | |

### `IngredientFormData`

Same as `Ingredient` but without `id` and `addedAt` (set automatically on creation).

---

## Components

### `App` — `App.tsx`

Root component. No props, no state. Sets up gesture handling, context, navigation, and tab/stack structure.

---

### `IngredientsProvider` — `src/context.tsx`

Provides global ingredient state to the whole app via React Context.

**Props**

| Prop | Type |
|---|---|
| `children` | `React.ReactNode` |

**State**

| Variable | Type | Description |
|---|---|---|
| `ingredients` | `Ingredient[]` | Full list of all ingredients |
| `loading` | `boolean` | `true` while reading from AsyncStorage on startup |
| `error` | `string \| null` | Error message if load or save fails |

**Hook: `useIngredients()`** — returns `{ ingredients, loading, error, addIngredient, updateIngredient, deleteIngredient }`

---

### `AddScreen` — `src/screens/AddScreen.tsx`

Screen for adding a new ingredient, with optional barcode scan to pre-fill the form.

**Props:** none (navigation screen)

**State**

| Variable | Type | Description |
|---|---|---|
| `formKey` | `number` | Incremented after a successful add to remount the form and clear all fields |
| `showScanner` | `boolean` | Whether the barcode scanner modal is open |
| `prefill` | `Partial<Ingredient> \| undefined` | Name and brand returned from a barcode scan |
| `saving` | `boolean` | `true` while `addIngredient` is running |

---

### `ExpiringScreen` — `src/screens/ExpiringScreen.tsx`

Screen listing ingredients that are expiring soon, grouped by urgency.

**Props:** none (navigation screen)

**State** (via `useExpiring` hook)

| Variable | Type | Description |
|---|---|---|
| `days` | `string` | The day window typed into the input field |

The hook also reads `ingredients`, `loading`, and `error` from context and computes `sections: ExpiringSection[]`.

---

### `BrowseScreen` — `src/screens/BrowseScreen.tsx`

Screen for filtering and searching all ingredients.

**Props:** none (navigation screen)

**State** (via `useBrowseFilter` hook)

| Variable | Type | Description |
|---|---|---|
| `query` | `QueryType` | Active filter tab (`'missing'`, `'recent'`, `'location'`, …) |
| `filterLocation` | `StorageLocation` | Selected location when `query === 'location'` |
| `filterCategory` | `Category` | Selected category when `query === 'category'` |
| `filterConfection` | `ConfectionType` | Selected confection type when `query === 'confection'` |

---

### `EditScreen` — `src/screens/EditScreen.tsx`

Screen for editing or deleting an existing ingredient.

**Props:** none (gets `id` from route params)

**State:** none — form state lives inside `IngredientForm`

---

### `IngredientForm` — `src/components/IngredientForm.tsx`

Reusable form used by both `AddScreen` (no delete button) and `EditScreen` (with delete button).

**Props**

| Prop | Type | Description |
|---|---|---|
| `initial` | `Partial<Ingredient>` | Pre-fills all fields (used in EditScreen) |
| `onSubmit` | `(data: IngredientFormData) => void` | Called when the user taps the submit button |
| `submitLabel` | `string` | Button label: `'Add ingredient'` or `'Save changes'` |
| `onDelete` | `() => void` | If provided, a Delete button appears below Submit |

**State**

| Variable | Type |
|---|---|
| `name` | `string` |
| `brand` | `string` |
| `category` | `Category \| undefined` |
| `location` | `StorageLocation \| undefined` |
| `confectionType` | `ConfectionType \| undefined` |
| `expirationDate` | `Date \| undefined` |
| `showPicker` | `boolean` |
| `ripeness` | `RipenessStatus \| undefined` |
| `ripenessCheckedAt` | `string \| undefined` |
| `isFrozen` | `boolean` |
| `isOpen` | `boolean` |
| `openedAt` | `string \| undefined` |

---

### `ChipPicker<T extends string>` — `src/components/IngredientForm.tsx` (internal)

A row of tappable chips that lets the user pick one value from a list. Tapping the selected chip deselects it.

**Props**

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Section heading |
| `options` | `T[]` | All available choices |
| `value` | `T \| undefined` | Currently selected value |
| `onChange` | `(v: T \| undefined) => void` | Called when a chip is tapped |

**State:** none

---

### `IngredientList` — `src/components/IngredientList.tsx`

A searchable, responsive list of ingredient cards. Switches from 1 to 2 to 3 columns based on screen width.

**Props**

| Prop | Type | Description |
|---|---|---|
| `ingredients` | `Ingredient[]` | Items to display |
| `onSelect` | `(ingredient: Ingredient) => void` | Called when a card is tapped |
| `emptyMessage` | `string` | Text shown when the list is empty |
| `header` | `React.ReactElement` | Optional element rendered above the list |
| `getAccentColor` | `(item: Ingredient) => string \| undefined` | Optional colored left border per item |

**State**

| Variable | Type | Description |
|---|---|---|
| `search` | `string` | Text in the search bar; filters the list client-side |

---

### `Tag` — `src/components/IngredientList.tsx` and `src/screens/ExpiringScreen.tsx` (internal)

Small chip showing a single label (category, location, ripeness, etc.).

**Props**

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | — |
| `bgColor` | `string` | `Colors.tagBg` |
| `textColor` | `string` | `Colors.textLight` |

**State:** none

---

### `SubFilter<T extends string>` — `src/screens/BrowseScreen.tsx` (internal)

A secondary row of chips used to pick a sub-filter value (e.g. which location to browse).

**Props**

| Prop | Type | Description |
|---|---|---|
| `options` | `T[]` | Available choices |
| `value` | `T` | Currently selected choice |
| `onChange` | `(v: T) => void` | Called when a chip is tapped |

**State:** none

---

### `BarcodeScanner` — `src/components/BarcodeScanner.tsx`

Full-screen modal that opens the camera, scans a barcode, and looks up the product on OpenFoodFacts.

**Props**

| Prop | Type | Description |
|---|---|---|
| `visible` | `boolean` | Controls whether the modal is open |
| `onClose` | `() => void` | Called when the user cancels |
| `onResult` | `(data: Partial<IngredientFormData>) => void` | Called with `{ name, brand }` on a successful lookup |

**State**

| Variable | Type | Description |
|---|---|---|
| `loading` | `boolean` | `true` while the OpenFoodFacts API request is in flight |
| `scanned` | `boolean` | `true` after a barcode is detected, prevents double-scan events |

---

## Component Tree

```
App
└── GestureHandlerRootView
    └── IngredientsProvider
        └── NavigationContainer
            └── Stack.Navigator
                ├── Tabs  [Stack.Screen]
                │   └── Tab.Navigator
                │       ├── AddScreen  [Tab: Add]
                │       │   ├── IngredientForm
                │       │   │   ├── ChipPicker  (Category)
                │       │   │   ├── ChipPicker  (Location)
                │       │   │   ├── ChipPicker  (ConfectionType)
                │       │   │   ├── ChipPicker  (Ripeness)       [conditional]
                │       │   │   ├── Switch      (Frozen)         [conditional]
                │       │   │   ├── Switch      (Open)
                │       │   │   ├── date display + Remove link   [conditional]
                │       │   │   ├── DateTimePicker               [conditional]
                │       │   │   └── Delete button                [conditional]
                │       │   └── BarcodeScanner  (Modal)          [conditional]
                │       │
                │       ├── ExpiringScreen  [Tab: Expiring]
                │       │   └── SectionList
                │       │       └── TouchableOpacity (per item)
                │       │           └── Tag  (×0–4 per item)
                │       │
                │       └── BrowseScreen  [Tab: Browse]
                │           ├── ScrollView  (query tab bar)
                │           ├── SubFilter                        [conditional]
                │           └── IngredientList
                │               └── FlatList
                │                   └── TouchableOpacity (per item)
                │                       └── Tag  (×0–7 per item)
                │
                └── EditScreen  [Stack.Screen: Edit]
                    └── IngredientForm
                        ├── ChipPicker  (Category)
                        ├── ChipPicker  (Location)
                        ├── ChipPicker  (ConfectionType)
                        ├── ChipPicker  (Ripeness)               [conditional]
                        ├── Switch      (Frozen)                 [conditional]
                        ├── Switch      (Open)
                        ├── date display + Remove link           [conditional]
                        ├── DateTimePicker                       [conditional]
                        └── Delete button
```

---

## Control Flow

The tree below uses these annotations:

- **`[CB↓ name]`** — a callback prop passed **down** from a parent to a child
- **`[→ CTX]`** — this callback triggers a **global state** update in `IngredientsProvider`
- **`[→ LOCAL]`** — this callback triggers a **local state** update in the same component
- **`[IF: condition]`** — this node is only rendered when `condition` is true

```
IngredientsProvider
│  STATE: ingredients[], loading, error
│
├── AddScreen
│   STATE: formKey, showScanner, prefill, saving
│   │
│   ├── IngredientForm
│   │   [CB↓ onSubmit = handleSubmit]
│   │     handleSubmit → addIngredient(newIngredient)
│   │       [→ CTX] prepends item to ingredients[]
│   │       [→ LOCAL] increments formKey  →  form unmounts and remounts (cleared)
│   │       [→ LOCAL] clears prefill
│   │   [CB↓ onDelete = undefined]  →  Delete button not rendered
│   │   │
│   │   ├── ChipPicker (Category)
│   │   │   [CB↓ onChange = setCategory]
│   │   │     [→ LOCAL] updates category in IngredientForm state
│   │   │
│   │   ├── ChipPicker (Location), ChipPicker (ConfectionType)
│   │   │   same pattern as above
│   │   │
│   │   ├── [IF: confectionType === 'fresh']
│   │   │   ChipPicker (Ripeness)
│   │   │   [CB↓ onChange = handleRipenessChange]
│   │   │     [→ LOCAL] sets ripeness + stamps ripenessCheckedAt
│   │   │
│   │   ├── [IF: confectionType === 'fresh']
│   │   │   Switch (Frozen)
│   │   │   [CB↓ onValueChange = handleFrozenToggle]
│   │   │     [→ LOCAL] sets isFrozen
│   │   │     [→ LOCAL] if toggled on: pushes expirationDate to ≥ 6 months
│   │   │
│   │   ├── Switch (Open)
│   │   │   [CB↓ onValueChange = handleOpenToggle]
│   │   │     [→ LOCAL] sets isOpen + stamps openedAt
│   │   │
│   │   ├── [IF: expirationDate !== undefined]
│   │   │   date display row + Remove link
│   │   │   Remove: [→ LOCAL] sets expirationDate = undefined
│   │   │
│   │   └── [IF: showPicker]
│   │       DateTimePicker
│   │       [CB↓ onChange = (_, date) => setExpirationDate(date)]
│   │         [→ LOCAL] updates expirationDate
│   │
│   └── [IF: showScanner]
│       BarcodeScanner (Modal)
│       STATE: scanned, loading
│       [CB↓ onClose = () => setShowScanner(false)]
│         [→ LOCAL] hides the modal
│       [CB↓ onResult = handleScanResult]
│         handleScanResult → sets prefill, increments formKey
│         [→ LOCAL] form remounts pre-filled with name + brand from barcode
│
├── ExpiringScreen
│   HOOK useExpiring() reads ingredients from CTX
│   STATE: days  →  controls how far ahead to look
│   │
│   └── SectionList  (sections computed by useExpiring from ingredients[])
│       [IF: loading]  →  ActivityIndicator instead of list
│       [IF: error]    →  error text instead of list
│       each item: onPress → navigation.navigate('Edit', { id })
│         [→ NAVIGATION] pushes EditScreen onto the stack
│
├── BrowseScreen
│   HOOK useBrowseFilter() reads ingredients from CTX
│   STATE: query, filterLocation, filterCategory, filterConfection
│   │
│   ├── query tab bar (ScrollView of chips)
│   │   onPress chip → [→ LOCAL] updates query
│   │     [IF: query changes]  →  SubFilter row swaps in/out
│   │
│   ├── [IF: query === 'location']
│   │   SubFilter (Location)
│   │   [CB↓ onChange = setFilterLocation]
│   │     [→ LOCAL] updates filterLocation  →  results list re-filters
│   │
│   ├── [IF: query === 'category']  SubFilter (Category)  — same pattern
│   ├── [IF: query === 'confection']  SubFilter (Confection)  — same pattern
│   │
│   └── IngredientList
│       STATE: search  →  client-side text filter on top of query results
│       [CB↓ onSelect = item => navigation.navigate('Edit', { id: item.id })]
│         [→ NAVIGATION] pushes EditScreen onto the stack
│
└── EditScreen  (receives id from route params)
    reads matching Ingredient from CTX
    [IF: ingredient not found]  →  renders nothing (null)
    useEffect: sets navigation header title to ingredient.name
    │
    └── IngredientForm  (pre-filled with existing ingredient data)
        [CB↓ onSubmit = handleSubmit]
          handleSubmit → updateIngredient({ ...ingredient, ...formData })
            [→ CTX] replaces the item in ingredients[]
            [→ NAVIGATION] goBack()
        [CB↓ onDelete = handleDelete]
          handleDelete (after Alert confirmation) → deleteIngredient(id)
            [→ CTX] removes the item from ingredients[]
            [→ NAVIGATION] goBack()
            [→ TREE] any list that reads ingredients[] re-renders without this item
```

### Summary of state-driven tree changes

| State change | What changes in the UI |
|---|---|
| `ingredients[]` updated in `IngredientsProvider` | All screens reading context re-render: `ExpiringScreen` list, `BrowseScreen` list |
| `loading = true` in `IngredientsProvider` | `ExpiringScreen` and `BrowseScreen` show `ActivityIndicator` instead of their lists |
| `error` set in `IngredientsProvider` | `ExpiringScreen` and `BrowseScreen` show an error message instead of their lists |
| `formKey` incremented in `AddScreen` | `IngredientForm` unmounts and remounts → all form fields reset |
| `showScanner = true` in `AddScreen` | `BarcodeScanner` modal slides in |
| `confectionType = 'fresh'` in `IngredientForm` | Ripeness chip picker and Frozen switch appear |
| `expirationDate` set in `IngredientForm` | Date display row and Remove link appear |
| `showPicker = true` in `IngredientForm` | `DateTimePicker` appears |
| `onDelete` prop provided to `IngredientForm` | Delete button appears at the bottom of the form |
| `query` changed in `BrowseScreen` | `SubFilter` row swaps between Location / Category / Confection chips (or disappears) |
| `search` typed in `IngredientList` | `FlatList` data is filtered client-side without a context update |
