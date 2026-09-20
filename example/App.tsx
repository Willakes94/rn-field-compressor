import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressInspectionPhoto, CompressionResult } from './src';

export default function App() {
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const pickAndCompressImage = async () => {
    // 1. Pick image from gallery
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1, // pick raw full-res image
    });

    if (pickerResult.canceled || !pickerResult.assets[0]) {
      return;
    }

    const rawUri = pickerResult.assets[0].uri;
    setSelectedUri(rawUri);
    setLoading(true);
    setResult(null);

    try {
      // 2. Compress using INSPECTION preset (1600px, 0.75 quality)
      const metrics = await compressInspectionPhoto(rawUri, {
        preset: 'INSPECTION',
      });
      setResult(metrics);
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>rn-field-compressor</Text>
      <Text style={styles.subtitle}>
        Vehicle Inspection & Field Operations Demo
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={pickAndCompressImage}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Compressing...' : 'Select Heavy Photo to Test'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 20 }} />}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compression Benchmark</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Original Size:</Text>
            <Text style={styles.statValue}>{result.originalSizeKB} KB ({(result.originalSizeKB / 1024).toFixed(2)} MB)</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Compressed Size:</Text>
            <Text style={[styles.statValue, styles.highlight]}>{result.compressedSizeKB} KB</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Reduction:</Text>
            <Text style={[styles.statValue, styles.success]}>-{result.reductionPercentage}%</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Processing Time:</Text>
            <Text style={styles.statValue}>{result.processingTimeMs} ms</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dimensions:</Text>
            <Text style={styles.statValue}>{result.width} x {result.height}px</Text>
          </View>

          <Text style={styles.previewLabel}>Compressed Preview (Plates & Details Sharp):</Text>
          <Image source={{ uri: result.uri }} style={styles.previewImage} resizeMode="contain" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statValue: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 14,
  },
  highlight: {
    color: '#38bdf8',
  },
  success: {
    color: '#4ade80',
  },
  previewLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
});
