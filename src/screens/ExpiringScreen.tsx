// Shows ingredients that the user should deal with soon, grouped into urgency sections.
// Uses SectionList so each urgency level (expired, today, this week, etc.) gets its own header.
// A colored left border on each item makes urgency visible at a glance.

import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useExpiring, ExpiringSection } from '../hooks/useExpiring'
import { getUrgencyColor, formatDate, hasMissingData, RIPENESS_COLORS } from '../utils/ingredients'
import { Ingredient, RootStackParamList } from '../types'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

type Nav = NativeStackNavigationProp<RootStackParamList>

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

export const ExpiringScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { days, setDays, sections, loading, error } = useExpiring()
  const { width } = useWindowDimensions()

  // Add horizontal padding on wide screens to keep content readable
  const sidePadding = width > 900 ? 48 : width > 450 ? 24 : 0

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
      <View style={[styles.control, { paddingHorizontal: Spacing.md + sidePadding }]}>
        <Text style={styles.controlLabel}>Expiring within</Text>
        <TextInput
          style={styles.daysInput}
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Text style={styles.controlLabel}>days</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No ingredients expiring within this period.</Text>
        }
        renderItem={({ item }) => {
          const accent = getUrgencyColor(item)
          return (
            <TouchableOpacity
              style={[
                styles.item,
                accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null,
              ]}
              onPress={() => navigation.navigate('Edit', { id: item.id })}
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
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: FontSizes.base,
    color: Colors.danger,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  controlLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  daysInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 52,
    textAlign: 'center',
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginTop: Spacing.sm,
  },
  sectionHeaderText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
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
    paddingHorizontal: Spacing.lg,
  },
})
