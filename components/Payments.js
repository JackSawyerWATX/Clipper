import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

const Payments = () => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    customerName: '',
    email: '',
    description: '',
    // Credit Card Fields
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    // ACH Fields
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    // Invoice Fields
    invoiceNumber: '',
    dueDate: '',
    terms: '30'
  });

  const [payments, setPayments] = useState([
    {
      id: '1',
      amount: 15420.50,
      customer: 'Delta Airlines',
      method: 'ACH',
      status: 'Completed',
      date: '2024-11-10',
      invoiceNumber: 'INV-2024-001',
      description: 'Engine Parts - Boeing 737'
    },
    {
      id: '2',
      amount: 8900.00,
      customer: 'Southwest Airlines',
      method: 'Credit Card',
      status: 'Processing',
      date: '2024-11-10',
      invoiceNumber: 'INV-2024-002',
      description: 'Avionics Equipment'
    },
    {
      id: '3',
      amount: 24650.75,
      customer: 'United Airlines',
      method: 'Wire Transfer',
      status: 'Pending',
      date: '2024-11-09',
      invoiceNumber: 'INV-2024-003',
      description: 'Landing Gear Components'
    }
  ]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePayment = () => {
    if (!paymentData.amount || !paymentData.customerName) {
      Alert.alert('Error', 'Please fill in required fields (Amount, Customer Name)');
      return;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'credit') {
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
        Alert.alert('Error', 'Please fill in all credit card fields');
        return;
      }
    } else if (paymentMethod === 'ach') {
      if (!paymentData.accountNumber || !paymentData.routingNumber) {
        Alert.alert('Error', 'Please fill in bank account details');
        return;
      }
    }

    const newPayment = {
      id: Date.now().toString(),
      amount: parseFloat(paymentData.amount),
      customer: paymentData.customerName,
      method: paymentMethod === 'credit' ? 'Credit Card' : paymentMethod === 'ach' ? 'ACH' : 'Invoice',
      status: paymentMethod === 'invoice' ? 'Pending' : 'Processing',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: paymentData.invoiceNumber || `INV-${Date.now()}`,
      description: paymentData.description || 'Aviation Parts & Services'
    };

    setPayments(prev => [newPayment, ...prev]);
    
    // Reset form
    setPaymentData({
      amount: '',
      customerName: '',
      email: '',
      description: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking',
      invoiceNumber: '',
      dueDate: '',
      terms: '30'
    });
    
    setShowPaymentForm(false);
    
    Alert.alert(
      'Success', 
      `Payment ${paymentMethod === 'invoice' ? 'invoice created' : 'processing initiated'} successfully!`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Processing': return '#FF9800';
      case 'Pending': return '#F44336';
      default: return '#666';
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'Completed').length;
  const processingPayments = payments.filter(p => p.status === 'Processing').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Processing</Text>
        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={() => setShowPaymentForm(true)}
        >
          <Text style={styles.addPaymentButtonText}>💳 Process Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Statistics */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedPayments}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{processingPayments}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{payments.length}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
      </ScrollView>

      {/* Recent Payments */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {payments.map(payment => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentCustomer}>{payment.customer}</Text>
              <Text style={styles.paymentInvoice}>Invoice: {payment.invoiceNumber}</Text>
              <Text style={styles.paymentDescription}>{payment.description}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
              <Text style={[styles.paymentStatus, { color: getStatusColor(payment.status) }]}>
                {payment.status}
              </Text>
            </View>
          </View>
          <View style={styles.paymentFooter}>
            <Text style={styles.paymentMethod}>{payment.method}</Text>
            <Text style={styles.paymentDate}>{payment.date}</Text>
          </View>
        </View>
      ))}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process New Payment</Text>
              <TouchableOpacity 
                onPress={() => setShowPaymentForm(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Basic Information */}
              <Text style={styles.fieldLabel}>Customer Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter customer name"
                value={paymentData.customerName}
                onChangeText={(text) => setPaymentData(prev => ({...prev, customerName: text}))}
              />

              <Text style={styles.fieldLabel}>Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={paymentData.amount}
                onChangeText={(text) => setPaymentData(prev => ({...prev, amount: text}))}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="customer@email.com"
                value={paymentData.email}
                onChangeText={(text) => setPaymentData(prev => ({...prev, email: text}))}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Payment description"
                value={paymentData.description}
                onChangeText={(text) => setPaymentData(prev => ({...prev, description: text}))}
              />

              {/* Payment Method Selection */}
              <Text style={styles.sectionHeader}>Payment Method</Text>
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={[styles.methodButton, paymentMethod === 'credit' && styles.activeMethod]}
                  onPress={() => setPaymentMethod('credit')}
                >
                  <Text style={[styles.methodText, paymentMethod === 'credit' && styles.activeMethodText]}>
                    💳 Credit Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodButton, paymentMethod === 'ach' && styles.activeMethod]}
                  onPress={() => setPaymentMethod('ach')}
                >
                  <Text style={[styles.methodText, paymentMethod === 'ach' && styles.activeMethodText]}>
                    🏦 ACH/Bank
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodButton, paymentMethod === 'invoice' && styles.activeMethod]}
                  onPress={() => setPaymentMethod('invoice')}
                >
                  <Text style={[styles.methodText, paymentMethod === 'invoice' && styles.activeMethodText]}>
                    📄 Invoice
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Credit Card Fields */}
              {paymentMethod === 'credit' && (
                <View style={styles.paymentFields}>
                  <Text style={styles.fieldLabel}>Cardholder Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name on card"
                    value={paymentData.cardholderName}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, cardholderName: text}))}
                  />
                  
                  <Text style={styles.fieldLabel}>Card Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, cardNumber: text}))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                  
                  <View style={styles.cardRow}>
                    <View style={styles.cardField}>
                      <Text style={styles.fieldLabel}>Exp Month *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM"
                        value={paymentData.expiryMonth}
                        onChangeText={(text) => setPaymentData(prev => ({...prev, expiryMonth: text}))}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <View style={styles.cardField}>
                      <Text style={styles.fieldLabel}>Exp Year *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY"
                        value={paymentData.expiryYear}
                        onChangeText={(text) => setPaymentData(prev => ({...prev, expiryYear: text}))}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                    <View style={styles.cardField}>
                      <Text style={styles.fieldLabel}>CVV *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        value={paymentData.cvv}
                        onChangeText={(text) => setPaymentData(prev => ({...prev, cvv: text}))}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* ACH Fields */}
              {paymentMethod === 'ach' && (
                <View style={styles.paymentFields}>
                  <Text style={styles.fieldLabel}>Account Type</Text>
                  <View style={styles.accountTypeContainer}>
                    <TouchableOpacity
                      style={[styles.accountTypeButton, paymentData.accountType === 'checking' && styles.activeAccount]}
                      onPress={() => setPaymentData(prev => ({...prev, accountType: 'checking'}))}
                    >
                      <Text style={styles.accountTypeText}>Checking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.accountTypeButton, paymentData.accountType === 'savings' && styles.activeAccount]}
                      onPress={() => setPaymentData(prev => ({...prev, accountType: 'savings'}))}
                    >
                      <Text style={styles.accountTypeText}>Savings</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.fieldLabel}>Routing Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456789"
                    value={paymentData.routingNumber}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, routingNumber: text}))}
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  
                  <Text style={styles.fieldLabel}>Account Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Account number"
                    value={paymentData.accountNumber}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, accountNumber: text}))}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              )}

              {/* Invoice Fields */}
              {paymentMethod === 'invoice' && (
                <View style={styles.paymentFields}>
                  <Text style={styles.fieldLabel}>Invoice Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Auto-generated if empty"
                    value={paymentData.invoiceNumber}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, invoiceNumber: text}))}
                  />
                  
                  <Text style={styles.fieldLabel}>Payment Terms (days)</Text>
                  <View style={styles.termsContainer}>
                    {['15', '30', '45', '60'].map(term => (
                      <TouchableOpacity
                        key={term}
                        style={[styles.termButton, paymentData.terms === term && styles.activeTerm]}
                        onPress={() => setPaymentData(prev => ({...prev, terms: term}))}
                      >
                        <Text style={styles.termText}>{term} days</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={styles.fieldLabel}>Due Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (auto-calculated if empty)"
                    value={paymentData.dueDate}
                    onChangeText={(text) => setPaymentData(prev => ({...prev, dueDate: text}))}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowPaymentForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.processButton} onPress={handlePayment}>
                <Text style={styles.processButtonText}>
                  {paymentMethod === 'invoice' ? 'Create Invoice' : 'Process Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addPaymentButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginRight: 15,
    minWidth: 140,
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
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  paymentInvoice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
  },
  paymentDetails: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
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
    maxHeight: '90%',
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
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  methodButton: {
    flex: 0.32,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeMethod: {
    backgroundColor: '#4CAF50',
  },
  methodText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeMethodText: {
    color: 'white',
  },
  paymentFields: {
    marginTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardField: {
    flex: 0.31,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  accountTypeButton: {
    flex: 0.48,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 10,
  },
  activeAccount: {
    backgroundColor: '#2196F3',
  },
  accountTypeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  termButton: {
    flex: 0.22,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTerm: {
    backgroundColor: '#FF9800',
  },
  termText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
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
  processButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  processButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Payments;