// The Browse screen lets the user filter and search through all ingredients.
// Filter tabs at the top update the list. Some tabs have a second row of sub-filter chips.

import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { IngredientList } from '../components/IngredientList'
import { RootStackParamList } from '../types'
import { LOCATIONS, CATEGORIES, CONFECTION_TYPES } from '../utils/ingredients'
import { useBrowseFilter, QUERY_TABS } from '../hooks/useBrowseFilter'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

type Nav = NativeStackNavigationProp<RootStackParamList>

export const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const {
    query,
    setQuery,
    filterLocation,
    setFilterLocation,
    filterCategory,
    setFilterCategory,
    filterConfection,
    setFilterConfection,
    results,
    loading,
    error,
  } = useBrowseFilter()

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {QUERY_TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, query === key && styles.tabActive]}
            onPress={() => setQuery(key)}
          >
            <Text style={[styles.tabText, query === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Show a second row of chips to pick a value when a filter tab is selected */}
      {query === 'location' && (
        <SubFilter options={LOCATIONS} value={filterLocation} onChange={setFilterLocation} />
      )}
      {query === 'category' && (
        <SubFilter options={CATEGORIES} value={filterCategory} onChange={setFilterCategory} />
      )}
      {query === 'confection' && (
        <SubFilter options={CONFECTION_TYPES} value={filterConfection} onChange={setFilterConfection} />
      )}

      <IngredientList
        ingredients={results}
        onSelect={item => navigation.navigate('Edit', { id: item.id })}
        emptyMessage={
          query === 'ripeness_check'
            ? 'All fresh items have been checked recently.'
            : 'No ingredients match this query.'
        }
      />
    </View>
  )
}

// A row of chips used as a secondary filter below the main tab bar
interface SubFilterProps<T extends string> {
  options: T[]
  value: T
  onChange: (v: T) => void
}

function SubFilter<T extends string>({ options, value, onChange }: SubFilterProps<T>): React.ReactElement {
  return (
    <View style={styles.subFilter}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: FontSizes.base,
    color: Colors.danger,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  tabsScroll: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tabsContent: { paddingHorizontal: Spacing.sm, paddingVertical: 10, gap: Spacing.sm - 2 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radii.chip,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.chipBg,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSizes.body, color: Colors.textMuted },
  tabTextActive: { color: Colors.surface, fontWeight: '600' },
  subFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.chipBg,
  },
  chipActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  chipText: { fontSize: FontSizes.sm, color: Colors.textMuted },
  chipTextActive: { color: Colors.surface },
})
