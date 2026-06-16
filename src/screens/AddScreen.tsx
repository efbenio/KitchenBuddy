// The screen where the user adds a new ingredient.
// They can either fill in the form manually or scan a barcode to pre-fill the name and brand.

import React, { useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { IngredientForm } from '../components/IngredientForm'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { useIngredients } from '../context'
import { Ingredient, IngredientFormData } from '../types'
import { generateId } from '../utils/ingredients'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

export const AddScreen: React.FC = () => {
  const { addIngredient } = useIngredients()

  // Changing formKey forces React to throw away the old form and mount a fresh one.
  // This is the simplest way to clear all fields after a successful add.
  const [formKey, setFormKey] = useState(0)
  const [showScanner, setShowScanner] = useState(false)
  const [prefill, setPrefill] = useState<Partial<Ingredient> | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: IngredientFormData): Promise<void> => {
    setSaving(true)
    try {
      const ingredient: Ingredient = {
        ...data,
        id: generateId(),
        addedAt: new Date().toISOString(),
      }
      await addIngredient(ingredient)
      // Clear the prefill and reset the form after a successful add
      setPrefill(undefined)
      setFormKey(k => k + 1)
      Alert.alert('Added', `${data.name} has been added.`)
    } catch {
      Alert.alert('Error', 'Could not add the ingredient. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Called when the barcode scanner finds a product.
  // The name and brand are passed to the form as initial values.
  const handleScanResult = (data: Partial<Ingredient>): void => {
    setPrefill(data)
    setFormKey(k => k + 1)
    setShowScanner(false)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
        <Ionicons name="barcode-outline" size={20} color={Colors.surface} />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

      {saving && <ActivityIndicator style={styles.saving} color={Colors.primary} />}

      {/* key={formKey} remounts the form completely whenever formKey changes */}
      <IngredientForm
        key={formKey}
        initial={prefill}
        onSubmit={handleSubmit}
        submitLabel="Add ingredient"
      />

      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onResult={handleScanResult}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    marginBottom: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radii.md,
    alignSelf: 'flex-start',
  },
  scanButtonText: { color: Colors.surface, fontSize: FontSizes.md, fontWeight: '600' },
  saving: { marginTop: Spacing.sm },
})
