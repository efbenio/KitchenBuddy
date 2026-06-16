// A full-screen modal that opens the camera and scans a barcode.
// Once a barcode is detected it looks up the product on OpenFoodFacts
// and sends the name and brand back to the caller.

import React, { useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { IngredientFormData } from '../types'
import { Colors, Spacing, Radii, FontSizes } from '../theme'

interface Props {
  visible: boolean
  onClose: () => void
  onResult: (data: Partial<IngredientFormData>) => void
}

// Calls the OpenFoodFacts public API with the scanned barcode.
// Returns just the name and brand we care about, or an empty object if the product was not found.
const fetchProductByBarcode = async (barcode: string): Promise<Partial<IngredientFormData>> => {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
  const json = await res.json()
  if (json.status !== 1 || !json.product)
    return {}
  const p = json.product
  return {
    name: p.product_name ?? p.product_name_en ?? '',
    brand: p.brands ?? undefined,
  }
}

export const BarcodeScanner: React.FC<Props> = ({ visible, onClose, onResult }) => {
  const [permission, requestPermission] = useCameraPermissions()
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)

  // Request camera permission immediately on component mount so the system dialog
  // appears before the user opens the scanner for the first time
  useEffect(() => {
    requestPermission()
  }, [])

  // Every time the modal opens, reset state so the camera is ready to scan again.
  // Without this, reopening the scanner after a failed scan would do nothing.
  useEffect(() => {
    if (visible) {
      setScanned(false)
      setLoading(false)
    }
  }, [visible])

  const handleClose = (): void => {
    setScanned(false)
    setLoading(false)
    onClose()
  }

  const handleScan = async ({ data }: { type: string; data: string }): Promise<void> => {
    // Ignore extra scan events that fire while we are already loading
    if (scanned || loading) return
    setScanned(true)
    setLoading(true)
    try {
      const result = await fetchProductByBarcode(data)
      if (!result.name) {
        setLoading(false)
        Alert.alert('Not found', `No product found for barcode ${data}.`, [
          { text: 'Scan again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: handleClose },
        ])
      } else {
        // Pass the product data back to AddScreen which will pre-fill the form
        onResult(result)
      }
    } catch {
      setLoading(false)
      Alert.alert('Error', 'Could not fetch product data. Check your connection.', [
        { text: 'Scan again', onPress: () => setScanned(false) },
        { text: 'Cancel', onPress: handleClose },
      ])
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {!permission ? (
          // Permission state is still loading
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : !permission.granted ? (
          // User has not given camera permission yet
          <View style={styles.center}>
            <Text style={styles.permissionText}>
              Camera access is needed to scan barcodes.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
              }}
              // Stop listening once a barcode has been scanned to prevent double-triggers
              onBarcodeScanned={scanned ? undefined : handleScan}
            />
            <View style={styles.overlay}>
              <View style={styles.scanBox} />
              <Text style={styles.hint}>Point the camera at a barcode</Text>
            </View>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.surface} />
                <Text style={styles.loadingText}>Looking up product...</Text>
              </View>
            )}
          </>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  permissionText: {
    color: Colors.surface,
    fontSize: FontSizes.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  buttonText: { color: Colors.surface, fontSize: FontSizes.base },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 240,
    height: 160,
    borderWidth: 2,
    borderColor: Colors.surface,
    borderRadius: Radii.md,
    backgroundColor: Colors.transparent,
  },
  hint: {
    color: Colors.surface,
    marginTop: Spacing.lg,
    fontSize: FontSizes.md,
    textShadowColor: Colors.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: { color: Colors.surface, fontSize: FontSizes.base },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.overlayMedium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
  },
  closeText: { color: Colors.surface, fontSize: FontSizes.lg, fontWeight: '600' },
})
