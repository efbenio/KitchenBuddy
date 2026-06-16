// The form used both when adding a new ingredient and when editing an existing one.
// It receives an optional "initial" object to pre-fill the fields (used in EditScreen).

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import {
  Category,
  ConfectionType,
  Ingredient,
  IngredientFormData,
  RipenessStatus,
  StorageLocation,
} from '../types'
import {
  CATEGORIES,
  LOCATIONS,
  CONFECTION_TYPES,
  RIPENESS_STATUSES,
  SIX_MONTHS_DAYS,
  addDays,
  extendExpiryToAtLeast,
} from '../utils/ingredients'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

// Quick date shortcuts so users don't always have to open the date picker
const ESTIMATES = [
  { label: '1 week', days: 7 },
  { label: '10 days', days: 10 },
  { label: '1 month', days: 30 },
]

interface Props {
  initial?: Partial<Ingredient>    // Pre-fills the form when editing
  onSubmit: (data: IngredientFormData) => void
  submitLabel: string              // "Add ingredient" or "Save changes"
  onDelete?: () => void            // If provided, a delete button appears below the submit button
}

export const IngredientForm: React.FC<Props> = ({ initial, onSubmit, submitLabel, onDelete }) => {
  const [name, setName] = useState(initial?.name ?? '')
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [category, setCategory] = useState<Category | undefined>(initial?.category)
  const [location, setLocation] = useState<StorageLocation | undefined>(initial?.location)
  const [confectionType, setConfectionType] = useState<ConfectionType | undefined>(
    initial?.confectionType
  )
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    initial?.expirationDate ? new Date(initial.expirationDate) : undefined
  )
  const [showPicker, setShowPicker] = useState(false)
  const [ripeness, setRipeness] = useState<RipenessStatus | undefined>(initial?.ripeness)
  const [ripenessCheckedAt, setRipenessCheckedAt] = useState<string | undefined>(
    initial?.ripenessCheckedAt
  )
  const [isFrozen, setIsFrozen] = useState(initial?.isFrozen ?? false)
  const [isOpen, setIsOpen] = useState(initial?.isOpen ?? false)
  const [openedAt, setOpenedAt] = useState<string | undefined>(initial?.openedAt)

  // Stamp the current time so the "Check ripeness" tab knows when we last looked at this item
  const handleRipenessChange = (r: RipenessStatus | undefined): void => {
    setRipeness(r)
    setRipenessCheckedAt(r ? new Date().toISOString() : undefined)
  }

  // Toggling frozen also pushes the expiry forward to at least 6 months from now
  const handleFrozenToggle = (next: boolean): void => {
    setIsFrozen(next)
    if (next) {
      setExpirationDate(extendExpiryToAtLeast(expirationDate, SIX_MONTHS_DAYS))
    }
  }

  // Record when the package was first opened so we can track freshness
  const handleOpenToggle = (next: boolean): void => {
    setIsOpen(next)
    setOpenedAt(next ? (openedAt ?? new Date().toISOString()) : undefined)
  }

  const handleSubmit = (): void => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter the ingredient name.')
      return
    }
    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      location,
      confectionType,
      expirationDate: expirationDate?.toISOString(),
      ripeness,
      ripenessCheckedAt,
      isFrozen,
      isOpen,
      openedAt,
    })
  }

  // Ripeness and frozen toggle only make sense for fresh items
  const isFresh = confectionType === 'fresh'

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Milk"
        placeholderTextColor={Colors.placeholder}
      />

      <Text style={styles.label}>Brand</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="e.g. Danone"
        placeholderTextColor={Colors.placeholder}
      />

      <ChipPicker label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
      <ChipPicker label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
      <ChipPicker
        label="Confection type"
        options={CONFECTION_TYPES}
        value={confectionType}
        onChange={setConfectionType}
      />

      {isFresh && (
        <>
          <ChipPicker
            label="Ripeness"
            options={RIPENESS_STATUSES}
            value={ripeness}
            onChange={handleRipenessChange}
          />

          <Text style={styles.label}>Frozen</Text>
          <View style={styles.toggleRow}>
            <Switch
              value={isFrozen}
              onValueChange={handleFrozenToggle}
              trackColor={{ true: Colors.primary }}
            />
            <Text style={styles.toggleLabel}>
              {isFrozen ? 'Yes — extends expiry to at least 6 months' : 'No'}
            </Text>
          </View>
        </>
      )}

      <Text style={styles.label}>Open</Text>
      <View style={styles.toggleRow}>
        <Switch
          value={isOpen}
          onValueChange={handleOpenToggle}
          trackColor={{ true: Colors.primary }}
        />
        <Text style={styles.toggleLabel}>
          {isOpen ? 'Opened — update expiry below if needed' : 'Closed / not opened'}
        </Text>
      </View>

      <Text style={styles.label}>Expiration date</Text>
      <View style={styles.row}>
        {ESTIMATES.map(({ label, days }) => (
          <TouchableOpacity
            key={label}
            style={styles.chip}
            onPress={() => setExpirationDate(addDays(days))}
          >
            <Text style={styles.chipText}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.chip} onPress={() => setShowPicker(true)}>
          <Text style={styles.chipText}>Pick date</Text>
        </TouchableOpacity>
      </View>

      {expirationDate && (
        <View style={styles.row}>
          <Text style={styles.dateText}>{expirationDate.toLocaleDateString()}</Text>
          <TouchableOpacity onPress={() => setExpirationDate(undefined)}>
            <Text style={styles.clearText}>  Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={expirationDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            if (Platform.OS !== 'ios') setShowPicker(false)
            if (date) setExpirationDate(date)
          }}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>

      {/* Only shown on the Edit screen */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete ingredient</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

// A row of tappable chips that lets the user pick one option from a list.
// Tapping the already-selected chip deselects it (sets the value back to undefined).
interface ChipPickerProps<T extends string> {
  label: string
  options: T[]
  value: T | undefined
  onChange: (v: T | undefined) => void
}

function ChipPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipPickerProps<T>): React.ReactElement {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipSelected]}
            onPress={() => onChange(value === opt ? undefined : opt)}
          >
            <Text style={[styles.chipText, value === opt && styles.chipTextSelected]}>
              {opt.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { padding: Spacing.lg, gap: Spacing.xs - 2 },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceMuted,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radii.chip,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.chipBg,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.body, color: Colors.textMuted },
  chipTextSelected: { color: Colors.surface },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.xs },
  toggleLabel: { fontSize: FontSizes.body, color: Colors.textMuted, flex: 1 },
  dateText: { fontSize: FontSizes.md, color: Colors.textSecondary, paddingVertical: Spacing.xs },
  clearText: { fontSize: FontSizes.md, color: Colors.danger, paddingVertical: Spacing.xs },
  doneButton: { alignSelf: 'flex-end', padding: Spacing.sm },
  doneText: { color: Colors.primary, fontWeight: '600', fontSize: FontSizes.base },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitText: { color: Colors.surface, fontSize: FontSizes.lg, fontWeight: '600' },
  deleteButton: {
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  deleteText: { color: Colors.danger, fontSize: FontSizes.base, fontWeight: '600' },
})
