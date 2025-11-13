import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import databaseAdapter from '../services/DatabaseAdapter';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    companyName: '',
    location: '',
    address: '',
    phone: '',
    contactName: '',
    contactEmail: '',
    specialization: '',
    paymentTerms: 'Net 30',
    deliveryTime: '',
    certifications: ''
  });

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // Primary: use adapter which will use MongoDB on server or fetch API on web
        const data = await databaseAdapter.getSuppliers({ sort: { companyName: 1 } });
        if (mounted && Array.isArray(data)) {
          setSuppliers(data);
          setLoading(false);
          return;
        }

        // Fallback: try direct fetch to backend API (useful when adapter fails)
        const base = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:4000';
        const resp = await fetch(`${base}/suppliers`);
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const json = await resp.json();
        if (mounted) setSuppliers(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const specializations = [
    'All', 
    'Engines', 
    'Avionics', 
    'Structural', 
    'Hydraulic', 
    'Navigation', 
    'Landing'
  ];
  
  const filteredSuppliers = suppliers.filter(supplier => {
    const name = (supplier.companyName || '').toLowerCase();
    const contact = (supplier.contactName || '').toLowerCase();
    const loc = (supplier.location || '').toLowerCase();
    const spec = (supplier.specialization || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || contact.includes(q) || loc.includes(q) || spec.includes(q);
    const matchesSpecialization = specializationFilter === 'All' || spec.includes(specializationFilter.toLowerCase());
    return matchesSearch && matchesSpecialization;
  });

  // Compute statistics and top suppliers from the live suppliers data
  const computeStats = (list) => {
    const totalSuppliers = list.length;
    const avgRatingRaw = totalSuppliers ? list.reduce((sum, s) => sum + (s.reliabilityRating || 0), 0) / totalSuppliers : 0;
    const avgRating = (isNaN(avgRatingRaw) ? 0 : avgRatingRaw).toFixed(1);
    const totalOrders = list.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
    const fastDeliverySuppliers = list.filter(s => {
      const dt = s.deliveryTime || '';
      const parts = dt.split('-');
      const candidate = parts[1] || parts[0] || '';
      const num = parseInt(candidate, 10);
      return !isNaN(num) && num <= 14;
    }).length;
    return { totalSuppliers, avgRating, totalOrders, fastDeliverySuppliers };
  };

  const getTopSuppliers = (list, limit = 3) => {
    return [...list].sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, limit);
  };

  const stats = computeStats(suppliers);
  const topSuppliers = getTopSuppliers(suppliers, 3);

  const getRatingColor = (rating) => {
    if (rating >= 4.7) return '#4CAF50';
    if (rating >= 4.5) return '#FF9800';
    return '#F44336';
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '');
  };

  const handleAddSupplier = () => {
    if (newSupplier.companyName.trim() && newSupplier.contactEmail.trim()) {
      const supplier = {
        id: `SUP${(suppliers.length + 1).toString().padStart(3, '0')}`,
        companyName: newSupplier.companyName.trim(),
        location: newSupplier.location.trim(),
        address: newSupplier.address.trim(),
        phone: newSupplier.phone.trim(),
        contactName: newSupplier.contactName.trim(),
        contactEmail: newSupplier.contactEmail.trim(),
        specialization: newSupplier.specialization.trim(),
        establishedSince: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        reliabilityRating: 0,
        paymentTerms: newSupplier.paymentTerms,
        deliveryTime: newSupplier.deliveryTime.trim(),
        certifications: newSupplier.certifications.split(',').map(s => s.trim()).filter(s => s)
      };

      setSuppliers([...suppliers, supplier]);
      setNewSupplier({
        companyName: '',
        location: '',
        address: '',
        phone: '',
        contactName: '',
        contactEmail: '',
        specialization: '',
        paymentTerms: 'Net 30',
        deliveryTime: '',
        certifications: ''
      });
      setShowAddSupplierModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Loading suppliers...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Supplier Network</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddSupplierModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Supplier</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading suppliers: {error}</Text>
        </View>
      ) : null}
      
      {/* Supplier Statistics */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsScrollContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSuppliers}</Text>
          <Text style={styles.statLabel}>Total Suppliers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgRating}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.fastDeliverySuppliers}</Text>
          <Text style={styles.statLabel}>Fast Delivery</Text>
        </View>
      </ScrollView>

      {/* Top Suppliers */}
      <Text style={styles.sectionTitle}>Top Suppliers by Orders</Text>
      {topSuppliers.map(supplier => (
        <View key={supplier._id || supplier.supplierId || supplier.id} style={styles.topSupplierCard}>
          {supplier ? (
            <>
              <View>
                <Text style={styles.supplierName}>{supplier.companyName || 'Unknown'}</Text>
                <Text style={styles.supplierLocation}>{supplier.location || 'Unknown'}</Text>
                <Text style={styles.supplierSpecialization}>{supplier.specialization || 'Not Specified'}</Text>
              </View>
              <View style={styles.supplierStats}>
                <Text style={styles.supplierOrders}>{supplier.totalOrders || 0} orders</Text>
                <Text style={[styles.supplierRating, { color: getRatingColor(supplier.reliabilityRating) }]}>
                  {getRatingStars(supplier.reliabilityRating)} {supplier.reliabilityRating || 0}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Invalid supplier data</Text>
          )}
        </View>
      ))}

      {/* Search and Filter */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search suppliers by name, location, or specialization..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {specializations.map(spec => (
          <TouchableOpacity
            key={spec}
            style={[styles.categoryButton, specializationFilter === spec && styles.activeCategoryButton]}
            onPress={() => setSpecializationFilter(spec)}
          >
            <Text style={[styles.categoryText, specializationFilter === spec && styles.activeCategoryText]}>
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filteredSuppliers.length} suppliers found</Text>

      {/* Suppliers List */}
      {filteredSuppliers.map(supplier => (
        <View key={supplier._id || supplier.supplierId || supplier.id} style={styles.supplierCard}>
          {supplier ? (
            <>
              <View style={styles.supplierHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>{supplier.companyName || 'Unknown Company'}</Text>
                  <Text style={styles.contactName}>{supplier.contactName || 'No Contact'}</Text>
                  <Text style={styles.supplierEmail}>{supplier.contactEmail || 'No Email'}</Text>
                  <Text style={styles.supplierPhone}>{supplier.phone || 'No Phone'}</Text>
                </View>
                <View style={styles.supplierRatingContainer}>
                  <Text style={[styles.ratingNumber, { color: getRatingColor(supplier.reliabilityRating) }]}>
                    {supplier.reliabilityRating || 0}
                  </Text>
                  <Text style={styles.ratingStars}>{getRatingStars(supplier.reliabilityRating)}</Text>
                  <Text style={styles.supplierSince}>Since: {supplier.establishedSince || 'Unknown'}</Text>
                </View>
              </View>

              <View style={styles.supplierDetails}>
                <Text style={styles.supplierAddress}>
                  {typeof supplier.address === 'object' && supplier.address 
                    ? `${supplier.address.city || ''} ${supplier.address.state || ''} ${supplier.address.country || ''}`.trim() || 'No Address'
                    : supplier.address || 'No Address'}
                </Text>
                <Text style={styles.supplierSpec}>Specialization: {supplier.specialization || 'Not Specified'}</Text>
                <View style={styles.businessInfo}>
                  <Text style={styles.businessDetail}>Orders: {supplier.totalOrders || 0}</Text>
                  <Text style={styles.businessDetail}>Delivery: {supplier.deliveryTime || 'Not Specified'}</Text>
                  <Text style={styles.businessDetail}>Terms: {supplier.paymentTerms || 'Not Specified'}</Text>
                </View>
              </View>

              <View style={styles.supplierFooter}>
                <View style={styles.certifications}>
                  <Text style={styles.certificationsTitle}>Certifications:</Text>
                  <View style={styles.certificationTags}>
                    {Array.isArray(supplier.certifications) && supplier.certifications.length > 0 ? 
                      supplier.certifications.map((cert, index) => (
                        <Text key={index} style={styles.certificationTag}>{cert}</Text>
                      )) : 
                      <Text style={styles.certificationTag}>None</Text>
                    }
                  </View>
                </View>
                <TouchableOpacity style={styles.supplierActionButton}>
                  <Text style={styles.supplierActionText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Invalid supplier data</Text>
          )}
        </View>
      ))}

      {/* Add Supplier Modal */}
      <Modal
        visible={showAddSupplierModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddSupplierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add New Supplier</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Company Name *"
                value={newSupplier.companyName}
                onChangeText={(text) => setNewSupplier({...newSupplier, companyName: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Location"
                value={newSupplier.location}
                onChangeText={(text) => setNewSupplier({...newSupplier, location: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Address"
                value={newSupplier.address}
                onChangeText={(text) => setNewSupplier({...newSupplier, address: text})}
                multiline
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Phone Number"
                value={newSupplier.phone}
                onChangeText={(text) => setNewSupplier({...newSupplier, phone: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Contact Name"
                value={newSupplier.contactName}
                onChangeText={(text) => setNewSupplier({...newSupplier, contactName: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Contact Email *"
                value={newSupplier.contactEmail}
                onChangeText={(text) => setNewSupplier({...newSupplier, contactEmail: text})}
                keyboardType="email-address"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Specialization"
                value={newSupplier.specialization}
                onChangeText={(text) => setNewSupplier({...newSupplier, specialization: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Payment Terms"
                value={newSupplier.paymentTerms}
                onChangeText={(text) => setNewSupplier({...newSupplier, paymentTerms: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Delivery Time"
                value={newSupplier.deliveryTime}
                onChangeText={(text) => setNewSupplier({...newSupplier, deliveryTime: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Certifications (comma separated)"
                value={newSupplier.certifications}
                onChangeText={(text) => setNewSupplier({...newSupplier, certifications: text})}
                multiline
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddSupplierModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddSupplier}
                >
                  <Text style={styles.saveButtonText}>Add Supplier</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  oldTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginRight: 15,
    minWidth: 130,
    width: 130,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    margin: 12,
  },
  errorText: {
    color: '#b00020',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  topSupplierCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  supplierLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supplierSpecialization: {
    fontSize: 11,
    color: '#2196F3',
    marginTop: 2,
  },
  supplierStats: {
    alignItems: 'flex-end',
  },
  supplierOrders: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  supplierRating: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
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
  supplierCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  supplierEmail: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  supplierPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supplierRatingContainer: {
    alignItems: 'flex-end',
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ratingStars: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 2,
  },
  supplierSince: {
    fontSize: 10,
    color: '#666',
  },
  supplierDetails: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  supplierAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  supplierSpec: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  businessDetail: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supplierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  certifications: {
    flex: 1,
    marginRight: 10,
  },
  certificationsTitle: {
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  certificationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  certificationTag: {
    fontSize: 9,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '500',
  },
  supplierActionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplierActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loaderText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Suppliers;