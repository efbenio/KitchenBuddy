// Root of the app. Sets up the navigation stack and provides the ingredient context to all screens.

import React from 'react'
import { StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { IngredientsProvider } from './src/context'
import { AddScreen } from './src/screens/AddScreen'
import { ExpiringScreen } from './src/screens/ExpiringScreen'
import { BrowseScreen } from './src/screens/BrowseScreen'
import { EditScreen } from './src/screens/EditScreen'
import { RootStackParamList, TabParamList } from './src/types'
import { Colors } from './src/theme'

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Add: 'add-circle-outline',
            Expiring: 'time-outline',
            Browse: 'search-outline',
          }
          return <Ionicons name={icons[route.name]} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Add" component={AddScreen} options={{ title: 'Add Ingredient' }} />
      <Tab.Screen name="Expiring" component={ExpiringScreen} options={{ title: 'Expiring Soon' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <IngredientsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            {/* options is a function so the header can render interactive, route-aware elements */}
            <Stack.Screen
              name="Edit"
              component={EditScreen}
              options={({ navigation }) => ({
                title: 'Edit Ingredient',
                headerRight: () => (
                  <Ionicons
                    name="close-outline"
                    size={26}
                    color={Colors.primary}
                    onPress={() => navigation.goBack()}
                  />
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </IngredientsProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
