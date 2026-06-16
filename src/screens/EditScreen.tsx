// The screen for editing an existing ingredient.
// Loads the ingredient by id, pre-fills the form, and saves changes on submit.
// The delete button lives inside the form, below the Save button.

import React, { useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { IngredientForm } from '../components/IngredientForm'
import { useIngredients } from '../context'
import { IngredientFormData, RootStackParamList } from '../types'
import { Colors } from '../theme'

type Route = RouteProp<RootStackParamList, 'Edit'>
type Nav = NativeStackNavigationProp<RootStackParamList>

export const EditScreen: React.FC = () => {
  const { params } = useRoute<Route>()
  const navigation = useNavigation<Nav>()
  const { ingredients, updateIngredient, deleteIngredient } = useIngredients()

  const ingredient = ingredients.find(i => i.id === params.id)

  // Update the navigation header title to the ingredient name once it is loaded
  useEffect(() => {
    if (ingredient) {
      navigation.setOptions({ title: ingredient.name })
    }
  }, [navigation, ingredient?.name])

  // If the ingredient was deleted elsewhere, just close this screen
  if (!ingredient) return null

  const handleSubmit = async (data: IngredientFormData): Promise<void> => {
    try {
      // Merge the updated form data onto the original ingredient to preserve id and addedAt
      await updateIngredient({ ...ingredient, ...data })
      navigation.goBack()
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.')
    }
  }

  const handleDelete = (): void => {
    // Ask for confirmation before deleting because this cannot be undone
    Alert.alert(
      'Delete ingredient',
      `Remove "${ingredient.name}" from your inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIngredient(ingredient.id)
              navigation.goBack()
            } catch {
              Alert.alert('Error', 'Could not delete the ingredient. Please try again.')
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <IngredientForm
        initial={ingredient}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        onDelete={handleDelete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
})
