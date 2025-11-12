// Image Comparison Demo - Shows Before/After of Aircraft Part Images
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { getPartImage } from '../utils/PartImageMapper.js';

const sampleParts = [
  {
    id: "AC001",
    name: "Spark Plug - Champion REM40E",
    category: "Engine Components",
    photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=300&fit=crop"
  },
  {
    id: "AC002", 
    name: "Oil Filter - Lycoming LW-13936",
    category: "Engine Components",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
  },
  {
    id: "AC015",
    name: "Navigation Light - LED Strobe",
    category: "Avionics",
    photo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop"
  },
  {
    id: "AC045",
    name: "Hydraulic Pump Assembly",
    category: "Hydraulics", 
    photo: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop"
  }
];

export default function ImageComparisonDemo() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aircraft Part Image Enhancement</Text>
      <Text style={styles.subtitle}>Before vs After - Generic Images vs Intelligent Matching</Text>
      
      {sampleParts.map((part) => (
        <View key={part.id} style={styles.comparisonRow}>
          <Text style={styles.partName}>{part.name}</Text>
          <View style={styles.imageComparison}>
            {/* Before: Generic/Original Image */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Before (Generic)</Text>
              <Image 
                source={{ uri: part.photo || '/api/placeholder/100/100' }} 
                style={styles.partImage} 
              />
            </View>
            
            {/* After: Smart Mapped Image */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>After (Smart Match)</Text>
              <Image 
                source={{ uri: getPartImage(part) }} 
                style={styles.partImage} 
              />
            </View>
          </View>
        </View>
      ))}
      
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>How It Works:</Text>
        <Text style={styles.explanationText}>
          • Analyzes part names for specific components (spark plug, oil filter, etc.)
        </Text>
        <Text style={styles.explanationText}>
          • Matches categories (Engine, Avionics, Hydraulics, Landing Gear)
        </Text>
        <Text style={styles.explanationText}>
          • Provides contextually appropriate aircraft part images
        </Text>
        <Text style={styles.explanationText}>
          • Falls back to generic aircraft images when no specific match found
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  comparisonRow: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  partName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  imageComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 10,
  },
  partImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  explanation: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  explanationText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 20,
  },
});