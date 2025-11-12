import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';

// Import data from existing components
let customersData = [];
let inventoryData = [];
let suppliersData = [];

try {
  const { customersData: importedCustomers } = require('../data/customersData');
  const { aircraftPartsInventory } = require('../data/aircraftInventory');
  const { suppliersData: importedSuppliers } = require('../data/suppliersData');
  
  customersData = importedCustomers || [];
  inventoryData = aircraftPartsInventory || [];
  suppliersData = importedSuppliers || [];
} catch (error) {
  console.warn('Failed to import data for orders:', error);
}

const PlaceOrder = () => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showPartSelect, setShowPartSelect] = useState(false);
  
  const [orderDetails, setOrderDetails] = useState({
    priority: 'Medium',
    shippingAddress: '',
    notes: '',
    paymentTerms: 'Net 30',
    estimatedDelivery: ''
  });

  useEffect(() => {
    // Set default estimated delivery to 7 days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    setOrderDetails(prev => ({
      ...prev,
      estimatedDelivery: deliveryDate.toISOString().split('T')[0]
    }));
  }, []);

  const filteredCustomers = customersData.filter(customer =>
    customer.companyName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.contactName?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const filteredParts = inventoryData.filter(part =>
    part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setOrderDetails(prev => ({
      ...prev,
      shippingAddress: `${customer.address || ''}, ${customer.city || ''}, ${customer.state || ''} ${customer.zipCode || ''}`
    }));
    setShowCustomerSelect(false);
    setCustomerSearchTerm('');
  };

  const handleAddItem = (part) => {
    const existingItemIndex = orderItems.findIndex(item => item.id === part.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        id: part.id,
        partId: part.id,
        partName: part.name,
        partNumber: part.partNumber,
        unitPrice: part.price,
        quantity: 1,
        manufacturer: part.manufacturer,
        inStock: part.inStock || part.quantity || 0
      };
      setOrderItems([...orderItems, newItem]);
    }
    setShowPartSelect(false);
    setSearchTerm('');
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the order');
      return;
    }

    // Check stock availability
    const outOfStockItems = orderItems.filter(item => item.quantity > item.inStock);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.partName).join(', ');
      Alert.alert('Stock Warning', `The following items have insufficient stock: ${itemNames}. Continue anyway?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => submitOrder() }
      ]);
    } else {
      submitOrder();
    }
  };

  const submitOrder = () => {
    const newOrder = {
      id: `ORD${Date.now().toString().slice(-6)}`,
      customerName: selectedCustomer.companyName,
      customerEmail: selectedCustomer.email,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Processing',
      priority: orderDetails.priority,
      totalAmount: calculateOrderTotal(),
      items: orderItems,
      shippingAddress: orderDetails.shippingAddress,
      estimatedDelivery: orderDetails.estimatedDelivery,
      notes: orderDetails.notes,
      paymentTerms: orderDetails.paymentTerms
    };

    console.log('Order placed:', newOrder);
    Alert.alert('Success', `Order ${newOrder.id} has been placed successfully!`);
    
    // Reset form
    setSelectedCustomer(null);
    setOrderItems([]);
    setOrderDetails({
      priority: 'Medium',
      shippingAddress: '',
      notes: '',
      paymentTerms: 'Net 30',
      estimatedDelivery: ''
    });
    setShowOrderModal(false);
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setOrderItems([]);
    setOrderDetails({
      priority: 'Medium',
      shippingAddress: '',
      notes: '',
      paymentTerms: 'Net 30',
      estimatedDelivery: ''
    });
    setShowOrderModal(false);
  };

  return (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Place New Order</Text>
        <TouchableOpacity 
          style={styles.startOrderButton}
          onPress={() => setShowOrderModal(true)}
        >
          <Text style={styles.startOrderButtonText}>+ Start New Order</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{customersData.length}</Text>
          <Text style={styles.statLabel}>Active Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inventoryData.length}</Text>
          <Text style={styles.statLabel}>Available Parts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{suppliersData.length}</Text>
          <Text style={styles.statLabel}>Suppliers</Text>
        </View>
      </View>

      <Text style={styles.instructions}>
        Click "Start New Order" to create a new order for your customers. You can select items from your inventory and manage all order details in one place.
      </Text>

      {/* Order Placement Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={false}
        onRequestClose={resetForm}
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Order</Text>
            <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Customer Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Customer</Text>
            <TouchableOpacity 
              style={[styles.customerSelector, selectedCustomer && styles.customerSelected]}
              onPress={() => setShowCustomerSelect(true)}
            >
              <Text style={styles.customerSelectorText}>
                {selectedCustomer ? 
                  `${selectedCustomer.companyName} (${selectedCustomer.contactName})` : 
                  'Choose Customer...'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Items Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Add Items</Text>
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => setShowPartSelect(true)}
            >
              <Text style={styles.addItemButtonText}>+ Add Part</Text>
            </TouchableOpacity>

            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.partName}</Text>
                  <Text style={styles.itemDetails}>{item.partNumber} - {item.manufacturer}</Text>
                  <Text style={styles.itemStock}>Stock: {item.inStock}</Text>
                </View>
                <View style={styles.itemControls}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Order Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Order Details</Text>
            
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    orderDetails.priority === priority && styles.priorityButtonSelected
                  ]}
                  onPress={() => setOrderDetails(prev => ({...prev, priority}))}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    orderDetails.priority === priority && styles.priorityButtonTextSelected
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Shipping Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter shipping address"
              value={orderDetails.shippingAddress}
              onChangeText={(text) => setOrderDetails(prev => ({...prev, shippingAddress: text}))}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Payment Terms</Text>
            <View style={styles.paymentTermsSelector}>
              {['Net 30', 'Net 60', 'COD', 'Prepaid'].map((terms) => (
                <TouchableOpacity
                  key={terms}
                  style={[
                    styles.paymentTermsButton,
                    orderDetails.paymentTerms === terms && styles.paymentTermsButtonSelected
                  ]}
                  onPress={() => setOrderDetails(prev => ({...prev, paymentTerms: terms}))}
                >
                  <Text style={[
                    styles.paymentTermsButtonText,
                    orderDetails.paymentTerms === terms && styles.paymentTermsButtonTextSelected
                  ]}>
                    {terms}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Estimated Delivery</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={orderDetails.estimatedDelivery}
              onChangeText={(text) => setOrderDetails(prev => ({...prev, estimatedDelivery: text}))}
            />

            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Order notes or special instructions"
              value={orderDetails.notes}
              onChangeText={(text) => setOrderDetails(prev => ({...prev, notes: text}))}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items:</Text>
                <Text style={styles.summaryValue}>{orderItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Quantity:</Text>
                <Text style={styles.summaryValue}>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>${calculateOrderTotal().toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerSelect}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomerSelect(false)}
      >
        <View style={styles.overlayModal}>
          <View style={styles.selectionModal}>
            <Text style={styles.selectionTitle}>Select Customer</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              value={customerSearchTerm}
              onChangeText={setCustomerSearchTerm}
            />

            <ScrollView style={styles.selectionList}>
              {filteredCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.selectionItem}
                  onPress={() => handleCustomerSelect(customer)}
                >
                  <Text style={styles.selectionItemTitle}>{customer.companyName}</Text>
                  <Text style={styles.selectionItemSubtitle}>{customer.contactName}</Text>
                  <Text style={styles.selectionItemDetails}>{customer.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeSelectionButton}
              onPress={() => setShowCustomerSelect(false)}
            >
              <Text style={styles.closeSelectionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Part Selection Modal */}
      <Modal
        visible={showPartSelect}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartSelect(false)}
      >
        <View style={styles.overlayModal}>
          <View style={styles.selectionModal}>
            <Text style={styles.selectionTitle}>Add Parts</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search parts..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            <ScrollView style={styles.selectionList}>
              {filteredParts.map((part) => (
                <TouchableOpacity
                  key={part.id}
                  style={styles.selectionItem}
                  onPress={() => handleAddItem(part)}
                >
                  <Text style={styles.selectionItemTitle}>{part.name}</Text>
                  <Text style={styles.selectionItemSubtitle}>{part.partNumber} - {part.manufacturer}</Text>
                  <Text style={styles.selectionItemDetails}>
                    ${part.price} | Stock: {part.inStock || part.quantity || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeSelectionButton}
              onPress={() => setShowPartSelect(false)}
            >
              <Text style={styles.closeSelectionButtonText}>Close</Text>
            </TouchableOpacity>
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
  startOrderButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  startOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
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
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 24,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  customerSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  customerSelected: {
    borderColor: '#28a745',
    backgroundColor: '#e8f5e9',
  },
  customerSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  addItemButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  itemStock: {
    fontSize: 12,
    color: '#007bff',
  },
  itemControls: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  quantityButton: {
    backgroundColor: '#ddd',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 25,
    height: 25,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 16,
    backgroundColor: 'white',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  priorityButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  priorityButtonTextSelected: {
    color: 'white',
  },
  paymentTermsSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  paymentTermsButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  paymentTermsButtonSelected: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  paymentTermsButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  paymentTermsButtonTextSelected: {
    color: 'white',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeOrderButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectionModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  selectionList: {
    maxHeight: 400,
  },
  selectionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectionItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectionItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  selectionItemDetails: {
    fontSize: 12,
    color: '#999',
  },
  closeSelectionButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeSelectionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PlaceOrder;