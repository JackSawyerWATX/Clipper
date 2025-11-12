import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { shipmentsData } from '../data/shippingData';

const Shipments = () => {
  const [shipments] = useState(shipmentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const shipmentStatuses = ['All', 'Processing', 'Pending', 'Shipped', 'In Transit', 'Delivered'];
  
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getShipmentStats = () => ({
    total: shipments.length,
    processing: shipments.filter(s => s.status === 'Processing').length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    shipped: shipments.filter(s => s.status === 'Shipped').length,
    inTransit: shipments.filter(s => s.status === 'In Transit').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return '#4CAF50';
      case 'In Transit': return '#FF9800';
      case 'Shipped': return '#2196F3';
      case 'Processing': return '#9C27B0';
      case 'Pending': return '#757575';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const stats = getShipmentStats();

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Shipments Tracking</Text>
      
      {/* Shipment Statistics */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsScrollContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Shipments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.processing}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.shipped}</Text>
          <Text style={styles.statLabel}>Shipped</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.inTransit}</Text>
          <Text style={styles.statLabel}>In Transit</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.delivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </ScrollView>

      {/* Search and Filter */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by tracking number, destination, or carrier..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {shipmentStatuses.map(status => (
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

      <Text style={styles.resultCount}>{filteredShipments.length} shipments found</Text>

      {/* Shipments List */}
      {filteredShipments.map(shipment => (
        <View key={shipment.id} style={styles.shipmentCard}>
          <View style={styles.shipmentHeader}>
            <View>
              <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
              <Text style={styles.destination}>To: {shipment.destination}</Text>
              <Text style={styles.itemCount}>{shipment.items.length} items • {shipment.carrier}</Text>
            </View>
            <View style={styles.shipmentStatusContainer}>
              <Text style={[styles.shipmentStatus, { color: getStatusColor(shipment.status) }]}>
                {shipment.status}
              </Text>
              <Text style={[styles.shipmentPriority, { backgroundColor: getPriorityColor(shipment.priority) }]}>
                {shipment.priority}
              </Text>
            </View>
          </View>

          <View style={styles.shipmentDetails}>
            <Text style={styles.itemsTitle}>Items in Shipment:</Text>
            <View style={styles.itemsList}>
              {shipment.items.map((item, index) => (
                <Text key={index} style={styles.itemTag}>
                  {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.shipmentFooter}>
            <View style={styles.dateInfo}>
              {shipment.estimatedDelivery && shipment.status !== 'Delivered' && (
                <Text style={styles.estimatedDate}>
                  Est. Delivery: {shipment.estimatedDelivery}
                </Text>
              )}
              {shipment.deliveredDate && (
                <Text style={styles.deliveredDate}>
                  Delivered: {shipment.deliveredDate}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Package</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  shipmentCard: {
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
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  destination: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shipmentStatusContainer: {
    alignItems: 'flex-end',
  },
  shipmentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shipmentPriority: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  shipmentDetails: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemTag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateInfo: {
    flex: 1,
  },
  estimatedDate: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  deliveredDate: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  trackButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Shipments;