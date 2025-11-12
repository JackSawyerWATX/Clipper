import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { invoicesData, recurringPurchasesData, getInvoiceStats, getInvoicesByStatus } from '../data/invoicesData';

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const stats = getInvoiceStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Overdue': return '#F44336';
      case 'Draft': return '#9E9E9E';
      case 'Scheduled': return '#2196F3';
      case 'Active': return '#4CAF50';
      case 'Pending Renewal': return '#FF9800';
      default: return '#666';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Invoices</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
          <Text style={styles.statLabel}>Paid Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>
            {formatCurrency(stats.outstandingAmount)}
          </Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {formatCurrency(stats.recurringRevenue)}
          </Text>
          <Text style={styles.statLabel}>Monthly Recurring</Text>
        </View>
      </View>

      <View style={styles.statusBreakdown}>
        <Text style={styles.sectionTitle}>Invoice Status Breakdown</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusText}>Paid: {stats.paid}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.statusText}>Pending: {stats.pending}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.statusText}>Overdue: {stats.overdue}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.statusText}>Scheduled: {stats.scheduled}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#9E9E9E' }]} />
            <Text style={styles.statusText}>Draft: {stats.draft}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderInvoiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.invoiceCard}
      onPress={() => {
        setSelectedInvoice(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <View style={styles.invoiceDetails}>
        <Text style={styles.invoiceDate}>Date: {formatDate(item.invoiceDate)}</Text>
        <Text style={styles.invoiceAmount}>{formatCurrency(item.total)}</Text>
      </View>
      <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
    </TouchableOpacity>
  );

  const renderRecurringItem = ({ item }) => (
    <View style={styles.recurringCard}>
      <View style={styles.recurringHeader}>
        <Text style={styles.recurringId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.productName}>{item.productName}</Text>
      <View style={styles.recurringDetails}>
        <Text style={styles.frequency}>{item.frequency} - {formatCurrency(item.amount)}</Text>
        <Text style={styles.nextInvoice}>Next: {formatDate(item.nextInvoiceDate)}</Text>
      </View>
      <Text style={styles.totalInvoices}>Total Invoices: {item.totalInvoices}</Text>
    </View>
  );

  const renderInvoiceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            {selectedInvoice && (
              <>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceNumber}>{selectedInvoice.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedInvoice.status) }]}>
                    <Text style={styles.statusBadgeText}>{selectedInvoice.status}</Text>
                  </View>
                </View>
                
                <View style={styles.customerInfo}>
                  <Text style={styles.modalSectionTitle}>Customer Information</Text>
                  <Text style={styles.modalText}>{selectedInvoice.customerName}</Text>
                  <Text style={styles.modalText}>{selectedInvoice.customerEmail}</Text>
                </View>

                <View style={styles.invoiceDates}>
                  <Text style={styles.modalSectionTitle}>Dates</Text>
                  <Text style={styles.modalText}>Invoice Date: {formatDate(selectedInvoice.invoiceDate)}</Text>
                  <Text style={styles.modalText}>Due Date: {formatDate(selectedInvoice.dueDate)}</Text>
                  {selectedInvoice.paidDate && (
                    <Text style={styles.modalText}>Paid Date: {formatDate(selectedInvoice.paidDate)}</Text>
                  )}
                </View>

                <View style={styles.itemsList}>
                  <Text style={styles.modalSectionTitle}>Items</Text>
                  {selectedInvoice.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.partName}</Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.invoiceTotals}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(selectedInvoice.subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(selectedInvoice.tax)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.grandTotal]}>
                    <Text style={styles.grandTotalLabel}>Total:</Text>
                    <Text style={styles.grandTotalAmount}>{formatCurrency(selectedInvoice.total)}</Text>
                  </View>
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={styles.modalSectionTitle}>Payment Information</Text>
                  <Text style={styles.modalText}>Terms: {selectedInvoice.terms}</Text>
                  {selectedInvoice.paymentMethod && (
                    <Text style={styles.modalText}>Payment Method: {selectedInvoice.paymentMethod}</Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Reports</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'invoices' && styles.activeTab]}
          onPress={() => setSelectedTab('invoices')}
        >
          <Text style={[styles.tabText, selectedTab === 'invoices' && styles.activeTabText]}>
            Invoices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recurring' && styles.activeTab]}
          onPress={() => setSelectedTab('recurring')}
        >
          <Text style={[styles.tabText, selectedTab === 'recurring' && styles.activeTabText]}>
            Recurring
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on selected tab */}
      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && renderOverview()}
        
        {selectedTab === 'invoices' && (
          <FlatList
            data={invoicesData}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {selectedTab === 'recurring' && (
          <FlatList
            data={recurringPurchasesData}
            renderItem={renderRecurringItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {renderInvoiceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    margin: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusBreakdown: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  invoiceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
  },
  recurringCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recurringId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 10,
  },
  recurringDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  frequency: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  nextInvoice: {
    fontSize: 14,
    color: '#666',
  },
  totalInvoices: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  customerInfo: {
    marginBottom: 20,
  },
  invoiceDates: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    lineHeight: 22,
  },
  itemsList: {
    marginBottom: 20,
  },
  itemRow: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  invoiceTotals: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentInfo: {
    marginBottom: 10,
  },
});

export default Reports;