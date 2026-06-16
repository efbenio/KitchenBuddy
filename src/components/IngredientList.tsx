// A scrollable list of ingredients with a search bar at the top.
// Adapts to screen width: one column on phones, two on tablets, three on wide screens.

import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { Ingredient } from '../types'
import { hasMissingData, formatDate, RIPENESS_COLORS } from '../utils/ingredients'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

interface Props {
  ingredients: Ingredient[]
  onSelect: (ingredient: Ingredient) => void
  emptyMessage?: string
  header?: React.ReactElement
  // Optional function that returns a border color per item. Used in Expiring Soon for urgency.
  getAccentColor?: (item: Ingredient) => string | undefined
}

// Wraps a label in a View so the background padding is truly symmetric.
// Putting backgroundColor on a Text directly causes uneven padding due to font metrics.
interface TagProps {
  label: string
  bgColor?: string
  textColor?: string
}

const Tag: React.FC<TagProps> = ({ label, bgColor = Colors.tagBg, textColor = Colors.textLight }) => (
  <View style={[styles.tag, { backgroundColor: bgColor }]}>
    <Text style={[styles.tagText, { color: textColor }]}>{label}</Text>
  </View>
)

export const IngredientList: React.FC<Props> = ({
  ingredients,
  onSelect,
  emptyMessage,
  header,
  getAccentColor,
}) => {
  const [search, setSearch] = useState('')
  const { width } = useWindowDimensions()

  // Switch from one to two to three columns as the screen grows
  const numColumns = width > 900 ? 3 : width > 450 ? 2 : 1
  const isMultiColumn = numColumns > 1

  const filtered = search
    ? ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : ingredients

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search..."
        placeholderTextColor={Colors.placeholder}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        key={String(numColumns)}
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={numColumns}
        ListHeaderComponent={header ?? null}
        ListEmptyComponent={
          <Text style={styles.empty}>{emptyMessage ?? 'No ingredients found.'}</Text>
        }
        renderItem={({ item }) => {
          const accent = getAccentColor ? getAccentColor(item) : undefined
          return (
            <TouchableOpacity
              style={[
                styles.item,
                isMultiColumn && styles.itemMultiColumn,
                accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null,
              ]}
              onPress={() => onSelect(item)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.nameBlock}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.brand && <Text style={styles.brandText}>{item.brand}</Text>}
                </View>
                {hasMissingData(item) && (
                  <View style={styles.missingBadge}>
                    <Text style={styles.missingBadgeText}>missing data</Text>
                  </View>
                )}
              </View>
              <View style={styles.tags}>
                {item.category && <Tag label={item.category} />}
                {item.location && <Tag label={item.location} />}
                {item.confectionType && <Tag label={item.confectionType} />}
                {item.expirationDate && (
                  <Tag label={`exp ${formatDate(item.expirationDate)}`} />
                )}
                {item.ripeness && (
                  <Tag
                    label={item.ripeness.replace('_', ' ')}
                    textColor={RIPENESS_COLORS[item.ripeness]}
                  />
                )}
                {item.isFrozen && (
                  <Tag label="frozen" bgColor={Colors.frozenBg} textColor={Colors.frozenText} />
                )}
                {item.isOpen && (
                  <Tag label="open" bgColor={Colors.openBg} textColor={Colors.openText} />
                )}
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    margin: Spacing.md,
    padding: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  item: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  itemMultiColumn: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameBlock: { flex: 1 },
  itemName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary },
  brandText: { fontSize: FontSizes.sm, color: Colors.textFaint, marginTop: 1 },
  missingBadge: {
    backgroundColor: Colors.missingBg,
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: Radii.chip,
  },
  missingBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.missingText,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm - 2 },
  tag: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  tagText: {
    fontSize: FontSizes.sm,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textDisabled,
    marginTop: 48,
    fontSize: FontSizes.base,
  },
})
