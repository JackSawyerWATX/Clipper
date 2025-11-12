import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { getPartImage } from '../utils/PartImageMapper.js';
import { DatabaseService } from '../services/DatabaseService.js';

// Initialize empty inventory - will be loaded from MongoDB
let aircraftPartsInventory = [];
const getCategories = () => ['Engine Components', 'Avionics', 'Electrical Components', 'Fuel System', 'Landing Gear', 'Control Surfaces', 'Propeller Components', 'Hardware', 'Interior', 'Flight Instruments'];

const ResponsiveManager = {
  isDesktop: (width) => width >= 1024,
  getGridColumns: (width, minWidth, spacing) => Math.floor(width / (minWidth + spacing)),
  getResponsiveStyles: (screenData, styles) => styles
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isDesktop, setIsDesktop] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    partNumber: '',
    manufacturer: '',
    category: '',
    quantity: '',
    price: '',
    description: '',
    location: '',
    minStock: ''
  });

  // Load inventory from MongoDB with fallback to static data
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to load from MongoDB (this will work in Node.js environment)
        try {
          const inventoryData = await DatabaseService.getAll('inventory');
          if (inventoryData && inventoryData.length > 0) {
            setInventory(inventoryData);
            console.log('✅ Loaded inventory from MongoDB:', inventoryData.length, 'items');
            return;
          }
        } catch (dbError) {
          console.warn('MongoDB not accessible from client, falling back to static data:', dbError.message);
        }
        
        // Fallback to static data (for client-side execution)
        try {
          const inventoryModule = await import('../data/aircraftInventory.js');
          const staticInventory = inventoryModule.aircraftPartsInventory || [];
          setInventory(staticInventory);
          console.log('✅ Loaded inventory from static data:', staticInventory.length, 'items');
        } catch (staticError) {
          throw new Error('Could not load inventory from either MongoDB or static files');
        }
        
      } catch (err) {
        console.error('Error loading inventory:', err);
        setError('Failed to load inventory data from both MongoDB and static files');
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const categories = ['All', ...getCategories()];

  const handleAddPart = async () => {
    if (!newPart.name.trim() || !newPart.partNumber.trim() || !newPart.manufacturer.trim()) {
      alert('Please fill in all required fields (Name, Part Number, Manufacturer)');
      return;
    }

    try {
      const part = {
        id: Date.now().toString(),
        name: newPart.name.trim(),
        partNumber: newPart.partNumber.trim(),
        manufacturer: newPart.manufacturer.trim(),
        category: newPart.category || 'Hardware',
        description: newPart.description || 'No description available',
        inStock: parseInt(newPart.quantity) || 0,
        price: parseFloat(newPart.price) || 0,
        minimumStock: parseInt(newPart.minStock) || 5,
        location: newPart.location || 'TBD',
        weight: '0 lbs',
        supplier: newPart.manufacturer.trim(),
        photo: '/api/placeholder/100/100',
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      // Try to save to MongoDB first (will work in Node.js environment)
      try {
        const savedPart = await DatabaseService.create('inventory', part);
        setInventory(prev => [savedPart, ...prev]);
        alert('Part added successfully to MongoDB!');
      } catch (dbError) {
        // Fallback to local state only (client-side limitation)
        console.warn('Could not save to MongoDB from client, adding to local state only:', dbError.message);
        setInventory(prev => [part, ...prev]);
        alert('Part added to local inventory! Note: To persist to MongoDB, you need an API server.');
      }
    } catch (error) {
      console.error('Error adding part:', error);
      alert('Failed to add part. Please try again.');
      return;
    }
    setNewPart({
      name: '',
      partNumber: '',
      manufacturer: '',
      category: '',
      quantity: '',
      price: '',
      description: '',
      location: '',
      minStock: ''
    });
    setShowAddModal(false);
  };

  const resetForm = () => {
    setNewPart({
      name: '',
      partNumber: '',
      manufacturer: '',
      category: '',
      quantity: '',
      price: '',
      description: '',
      location: '',
      minStock: ''
    });
    setShowAddModal(false);
  };
  
  useEffect(() => {
    const updateScreenData = () => {
      const newScreenData = Dimensions.get('window');
      setScreenData(newScreenData);
      setIsDesktop(ResponsiveManager.isDesktop(newScreenData.width));
    };

    const subscription = Dimensions.addEventListener('change', updateScreenData);
    updateScreenData();

    return () => subscription?.remove();
  }, []);
  
  const filteredParts = (inventory || []).filter(part => {
    if (!part) return false;
    const matchesSearch = (part.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (part.partNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (part.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const gridCols = ResponsiveManager.getGridColumns(screenData.width, 300, 20);
  const responsiveStyles = ResponsiveManager.getResponsiveStyles(screenData, styles);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Loading inventory from MongoDB...</Text>
        <Text style={styles.subtitle}>Please wait while we fetch your aircraft parts data.</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.title, { color: '#e74c3c', textAlign: 'center' }]}>Error Loading Inventory</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginVertical: 10 }]}>{error}</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', fontSize: 14, color: '#7f8c8d' }]}>
          Note: For full MongoDB integration, you'll need to set up an API server.
        </Text>
        <Text style={[styles.subtitle, { textAlign: 'center', fontSize: 14, color: '#7f8c8d' }]}>
          Currently using fallback to static data files.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.content, responsiveStyles.content]}>
      <View style={[styles.header, responsiveStyles.header]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, responsiveStyles.title]}>Aircraft Parts Inventory</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>➕ Add Part</Text>
          </TouchableOpacity>
        </View>
        
        {/* Desktop Stats Bar */}
        {isDesktop && (
          <View style={styles.desktopStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Total Parts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredParts.length}</Text>
              <Text style={styles.statLabel}>Filtered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.max(0, categories.length - 1)}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Search and Filter Controls */}
      <View style={[styles.controlsContainer, responsiveStyles.controlsContainer]}>
        <TextInput
          style={[styles.searchInput, responsiveStyles.searchInput]}
          placeholder="Search parts, part numbers, manufacturers..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={[styles.resultCount, responsiveStyles.resultCount]}>
        {filteredParts.length} parts found
      </Text>
      
      {/* Parts Grid/List */}
      <View style={[
        styles.partsContainer,
        isDesktop && { 
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }
      ]}>
        {filteredParts.slice(0, isDesktop ? 50 : 20).map(part => (
          <View key={part.id} style={[
            styles.partCard,
            isDesktop && {
              width: `${(100 / gridCols) - 2}%`,
              marginBottom: 20,
              minHeight: 280
            }
          ]}>
                          <Image 
                source={{ uri: getPartImage(part) }} 
                style={styles.partImage} 
              />
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{part.name || 'Unknown Part'}</Text>
              <Text style={styles.partNumber}>P/N: {part.partNumber || 'N/A'}</Text>
              <Text style={styles.manufacturer}>{part.manufacturer || 'Unknown'}</Text>
              <Text style={styles.partDescription} numberOfLines={2}>{part.description || 'No description available'}</Text>
              <View style={styles.partDetails}>
                <Text style={styles.partPrice}>${part.price || '0.00'}</Text>
                <Text style={[
                  styles.partStock, 
                  (part.inStock || part.quantity || 0) <= (part.minimumStock || part.minStock || 0) && styles.lowStock
                ]}>
                  Stock: {part.inStock || part.quantity || 0}
                </Text>
                <Text style={styles.partLocation}>{part.location || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Inventory Item</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Part Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter part name"
                value={newPart.name}
                onChangeText={(text) => setNewPart(prev => ({...prev, name: text}))}
              />

              <Text style={styles.fieldLabel}>Part Number *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter part number"
                value={newPart.partNumber}
                onChangeText={(text) => setNewPart(prev => ({...prev, partNumber: text}))}
              />

              <Text style={styles.fieldLabel}>Manufacturer *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter manufacturer"
                value={newPart.manufacturer}
                onChangeText={(text) => setNewPart(prev => ({...prev, manufacturer: text}))}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter category (e.g., Engine, Avionics)"
                value={newPart.category}
                onChangeText={(text) => setNewPart(prev => ({...prev, category: text}))}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputThird}>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    value={newPart.quantity}
                    onChangeText={(text) => setNewPart(prev => ({...prev, quantity: text}))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputThird}>
                  <Text style={styles.fieldLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0.00"
                    value={newPart.price}
                    onChangeText={(text) => setNewPart(prev => ({...prev, price: text}))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputThird}>
                  <Text style={styles.fieldLabel}>Min Stock</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    value={newPart.minStock}
                    onChangeText={(text) => setNewPart(prev => ({...prev, minStock: text}))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Storage Location</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter storage location (e.g., Warehouse A, Shelf 3B)"
                value={newPart.location}
                onChangeText={(text) => setNewPart(prev => ({...prev, location: text}))}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.multilineInput]}
                placeholder="Enter part description and specifications"
                value={newPart.description}
                onChangeText={(text) => setNewPart(prev => ({...prev, description: text}))}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddPart}>
                <Text style={styles.saveButtonText}>Add Part</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  desktopStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  partsContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCategoryButton: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  partCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  partNumber: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 2,
  },
  manufacturer: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  partDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    lineHeight: 16,
  },
  partDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  partPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  partStock: {
    fontSize: 14,
    color: '#666',
  },
  lowStock: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  partLocation: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalForm: {
    maxHeight: 350,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputThird: {
    flex: 0.31,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Inventory;