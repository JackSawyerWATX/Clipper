import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { customersData, getCustomerStats, getTopCustomersBySpending } from '../data/customersData';

const Customers = () => {
  const [customers, setCustomers] = useState(customersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const customerStatuses = ['All', 'Active', 'Inactive'];

  const handleAddCustomer = () => {
    if (!newCustomer.companyName.trim() || !newCustomer.contactName.trim() || !newCustomer.email.trim()) {
      alert('Please fill in all required fields (Company Name, Contact Name, Email)');
      return;
    }

    const customer = {
      id: Date.now().toString(),
      ...newCustomer,
      status: 'Active',
      totalOrders: 0,
      totalSpent: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastOrderDate: null
    };

    setCustomers(prev => [customer, ...prev]);
    setNewCustomer({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    });
    setShowAddModal(false);
  };

  const resetForm = () => {
    setNewCustomer({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    });
    setShowAddModal(false);
  };
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getCustomerStats();
  const topCustomers = getTopCustomersBySpending(3);

  return (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>➕ Add Customer</Text>
        </TouchableOpacity>
      </View>
      
      {/* Customer Statistics */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsScrollContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${(stats.totalValue/1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${(stats.avgOrderValue).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Avg Order Value</Text>
        </View>
      </ScrollView>

      {/* Top Customers */}
      <Text style={styles.sectionTitle}>Top Customers by Revenue</Text>
      {topCustomers.map(customer => (
        <View key={customer.id} style={styles.topCustomerCard}>
          <View>
            <Text style={styles.customerName}>{customer.companyName}</Text>
            <Text style={styles.customerContact}>{customer.contactName}</Text>
            <Text style={styles.customerOrders}>{customer.totalOrders} orders</Text>
          </View>
          <Text style={styles.customerRevenue}>${customer.totalSpent.toLocaleString()}</Text>
        </View>
      ))}

      {/* Search and Filter */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search customers by company, contact, or email..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {customerStatuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.categoryButton, statusFilter === status && styles.activeCategoryButton]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.categoryText, statusFilter === status && styles.activeCategoryText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filteredCustomers.length} customers found</Text>

      {/* Customers List */}
      {filteredCustomers.map(customer => (
        <View key={customer.id} style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{customer.companyName}</Text>
              <Text style={styles.contactName}>{customer.contactName}</Text>
              <Text style={styles.customerEmail}>{customer.email}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>
            <View style={styles.customerStats}>
              <Text style={[styles.customerStatus, { color: customer.status === 'Active' ? '#4CAF50' : '#F44336' }]}>
                {customer.status}
              </Text>
              <Text style={styles.customerSince}>Since: {customer.customerSince}</Text>
            </View>
          </View>

          <View style={styles.customerDetails}>
            <Text style={styles.customerAddress}>{customer.address}</Text>
            <View style={styles.businessInfo}>
              <Text style={styles.businessDetail}>Orders: {customer.totalOrders}</Text>
              <Text style={styles.businessDetail}>Total Spent: ${customer.totalSpent.toLocaleString()}</Text>
              <Text style={styles.businessDetail}>Credit Limit: ${customer.creditLimit.toLocaleString()}</Text>
              <Text style={styles.businessDetail}>Terms: {customer.paymentTerms}</Text>
            </View>
          </View>

          <View style={styles.customerFooter}>
            <View style={styles.primaryContact}>
              <Text style={styles.primaryContactTitle}>Primary Contact:</Text>
              <Text style={styles.primaryContactName}>{customer.primaryContact.name}</Text>
              <Text style={styles.primaryContactTitle}>{customer.primaryContact.title}</Text>
            </View>
            <TouchableOpacity style={styles.customerActionButton}>
              <Text style={styles.customerActionText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add Customer Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Company Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter company name"
                value={newCustomer.companyName}
                onChangeText={(text) => setNewCustomer(prev => ({...prev, companyName: text}))}
              />

              <Text style={styles.fieldLabel}>Contact Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter contact person name"
                value={newCustomer.contactName}
                onChangeText={(text) => setNewCustomer(prev => ({...prev, contactName: text}))}
              />

              <Text style={styles.fieldLabel}>Email *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter email address"
                value={newCustomer.email}
                onChangeText={(text) => setNewCustomer(prev => ({...prev, email: text}))}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter phone number"
                value={newCustomer.phone}
                onChangeText={(text) => setNewCustomer(prev => ({...prev, phone: text}))}
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter street address"
                value={newCustomer.address}
                onChangeText={(text) => setNewCustomer(prev => ({...prev, address: text}))}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="City"
                    value={newCustomer.city}
                    onChangeText={(text) => setNewCustomer(prev => ({...prev, city: text}))}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="State"
                    value={newCustomer.state}
                    onChangeText={(text) => setNewCustomer(prev => ({...prev, state: text}))}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.fieldLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="ZIP"
                    value={newCustomer.zipCode}
                    onChangeText={(text) => setNewCustomer(prev => ({...prev, zipCode: text}))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Country"
                    value={newCustomer.country}
                    onChangeText={(text) => setNewCustomer(prev => ({...prev, country: text}))}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCustomer}>
                <Text style={styles.saveButtonText}>Add Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  topCustomerCard: {
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  customerOrders: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  customerRevenue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  customerCard: {
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
  customerHeader: {
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
  customerEmail: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  customerStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerSince: {
    fontSize: 12,
    color: '#666',
  },
  customerDetails: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  customerAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  businessDetail: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryContact: {
    flex: 1,
  },
  primaryContactTitle: {
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
  },
  primaryContactName: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  customerActionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
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
    maxWidth: 500,
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
    maxHeight: 300,
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    flex: 0.48,
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
    backgroundColor: '#4CAF50',
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

export default Customers;