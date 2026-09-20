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
import {
  pickAndCompress,
  captureAndCompress,
  CompressionResult,
} from './src';

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handlePickFromGallery = async () => {
    setLoading(true);
    setResult(null);
    try {
      // 1-line call: Requests permission, launches library, compresses with INSPECTION preset
      const res = await pickAndCompress({
        preset: 'INSPECTION',
      });
      if (res && !Array.isArray(res)) {
        setResult(res);
      }
    } catch (error) {
      console.error('Gallery picker failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureFromCamera = async () => {
    setLoading(true);
    setResult(null);
    try {
      // 1-line call: Requests camera permission, takes photo, compresses automatically
      const res = await captureAndCompress({
        preset: 'INSPECTION',
      });
      if (res) {
        setResult(res);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>rn-field-compressor 📸</Text>
      <Text style={styles.subtitle}>
        Built-in Picker & Camera Demo (v1.1)
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePickFromGallery}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : '🖼️ Pick & Compress (Gallery)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={handleCaptureFromCamera}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : '📷 Capture & Compress (Camera)'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 24 }} />}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Real-time Benchmark</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Original Size:</Text>
            <Text style={styles.statValue}>
              {result.originalSizeKB} KB ({(result.originalSizeKB / 1024).toFixed(2)} MB)
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Compressed Size:</Text>
            <Text style={[styles.statValue, styles.highlight]}>{result.compressedSizeKB} KB</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bandwidth Saved:</Text>
            <Text style={[styles.statValue, styles.success]}>-{result.reductionPercentage}%</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Processing Time:</Text>
            <Text style={styles.statValue}>{result.processingTimeMs} ms</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Final Dimensions:</Text>
            <Text style={styles.statValue}>{result.width} x {result.height}px</Text>
          </View>

          <Text style={styles.previewLabel}>Optimized Output (Plates & Details Sharp):</Text>
          <Image source={{ uri: result.uri }} style={styles.previewImage} resizeMode="contain" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#0f766e',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 14,
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
    marginTop: 14,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    backgroundColor: '#020617',
  },
});
