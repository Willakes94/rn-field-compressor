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
import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={36} color="#38bdf8" style={styles.headerIcon} />
        <Text style={styles.title}>rn-field-compressor</Text>
        <Text style={styles.subtitle}>Field Operations & Vehicle Inspection Pipeline</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePickFromGallery}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Pick & Compress (Gallery)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={handleCaptureFromCamera}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Capture & Compress (Camera)'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Compressing image in memory...</Text>
        </View>
      )}

      {result && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer-outline" size={22} color="#38bdf8" />
            <Text style={styles.cardTitle}>Real-time Benchmark</Text>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statLabelGroup}>
              <Ionicons name="document-outline" size={16} color="#94a3b8" />
              <Text style={styles.statLabel}>Original Size:</Text>
            </View>
            <Text style={styles.statValue}>
              {result.originalSizeKB} KB ({(result.originalSizeKB / 1024).toFixed(2)} MB)
            </Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelGroup}>
              <Ionicons name="archive-outline" size={16} color="#38bdf8" />
              <Text style={styles.statLabel}>Compressed Size:</Text>
            </View>
            <Text style={[styles.statValue, styles.highlight]}>{result.compressedSizeKB} KB</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelGroup}>
              <Ionicons name="trending-down-outline" size={16} color="#4ade80" />
              <Text style={styles.statLabel}>Bandwidth Saved:</Text>
            </View>
            <Text style={[styles.statValue, styles.success]}>-{result.reductionPercentage}%</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelGroup}>
              <Ionicons name="timer-outline" size={16} color="#94a3b8" />
              <Text style={styles.statLabel}>Execution Time:</Text>
            </View>
            <Text style={styles.statValue}>{result.processingTimeMs} ms</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelGroup}>
              <Ionicons name="scan-outline" size={16} color="#94a3b8" />
              <Text style={styles.statLabel}>Output Resolution:</Text>
            </View>
            <Text style={styles.statValue}>{result.width} x {result.height}px</Text>
          </View>

          <View style={styles.previewHeader}>
            <Ionicons name="eye-outline" size={16} color="#94a3b8" />
            <Text style={styles.previewLabel}>Optimized Output (Sharp Text & Details):</Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
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
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cameraButton: {
    backgroundColor: '#0f766e',
    shadowColor: '#0f766e',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#38bdf8',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontWeight: '700',
  },
  success: {
    color: '#4ade80',
    fontWeight: '700',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  previewLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
  },
});
