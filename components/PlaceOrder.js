import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import DatabaseAdapter from '../services/DatabaseAdapter';

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

const PlaceOrder = ({ showOrderModal, setShowOrderModal }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showPartSelect, setShowPartSelect] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
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
    
    // Fetch recent orders
    fetchRecentOrders();
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

  // Fetch recent orders from last 24 hours
  const fetchRecentOrders = async () => {
    try {
      console.log('📋 Fetching recent orders from database...');
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const orders = await DatabaseAdapter.getOrders();
      console.log(`📊 Total orders retrieved: ${orders.length}`);
      
      const recentOrdersList = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const isRecent = orderDate >= twentyFourHoursAgo;
        if (isRecent) {
          console.log(`✅ Recent order found: ${order.orderId} - ${orderDate.toLocaleString()}`);
        }
        return isRecent;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Most recent first
      
      setRecentOrders(recentOrdersList);
      console.log(`🎯 Found ${recentOrdersList.length} orders in the last 24 hours`);
      
      // Log the most recent order for debugging
      if (recentOrdersList.length > 0) {
        const newest = recentOrdersList[0];
        console.log(`🆕 Most recent order: ${newest.orderId} at ${new Date(newest.createdAt).toLocaleString()}`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch recent orders:', error);
    }
  };

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
      
      // Optional: Show feedback
      console.log(`Updated ${part.name} quantity to ${updatedItems[existingItemIndex].quantity}`);
    } else {
      // Add new item
      const newItem = {
        id: part.id,
        partId: part.id,
        partName: part.name,
        partNumber: part.partNumber,
        unitPrice: parseFloat(part.price || 0),
        quantity: 1,
        manufacturer: part.manufacturer,
        inStock: part.inStock || part.quantity || 0
      };
      setOrderItems([...orderItems, newItem]);
      
      // Optional: Show feedback
      console.log(`Added ${part.name} to order`);
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
    let total = 0;
    console.log('Calculating order total for', orderItems.length, 'items:');
    
    orderItems.forEach((item, index) => {
      const itemUnitPrice = parseFloat(item.unitPrice || 0);
      const itemQuantity = parseInt(item.quantity || 0);
      const itemTotal = itemUnitPrice * itemQuantity;
      
      console.log(`Item ${index + 1}:`, {
        name: item.partName,
        unitPrice: itemUnitPrice,
        quantity: itemQuantity,
        itemTotal: itemTotal
      });
      
      total += itemTotal;
    });
    
    console.log('Grand Total:', total);
    return total;
  };

  const handlePlaceOrder = async () => {
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
        { text: 'Continue', onPress: async () => await submitOrder() }
      ]);
    } else {
      await submitOrder();
    }
  };

  const submitOrder = async () => {

    setIsPlacingOrder(true);
    try {
      // Fetch all existing orders to determine the next sequential order number
      const allOrders = await DatabaseAdapter.getOrders();
      let maxOrderNum = 0;
      allOrders.forEach(order => {
        // Accept both orderId and id fields
        const idStr = (order.orderId || order.id || '').toString();
        const match = idStr.match(/^ORD(\d{3})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxOrderNum) maxOrderNum = num;
        }
      });
      const nextOrderNum = maxOrderNum + 1;
      const nextOrderId = `ORD${nextOrderNum.toString().padStart(3, '0')}`;

      const orderData = {
        orderId: nextOrderId,
        customer: selectedCustomer._id || selectedCustomer.customerId,
        customerName: selectedCustomer.companyName,
        customerEmail: selectedCustomer.email,
        orderDate: new Date(),
        status: 'Processing',
        priority: orderDetails.priority,
        items: orderItems.map(item => ({
          partId: item.partId,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity
        })),
        totalAmount: calculateOrderTotal(),
        shippingAddress: orderDetails.shippingAddress,
        estimatedDelivery: orderDetails.estimatedDelivery ? new Date(orderDetails.estimatedDelivery) : null,
        notes: orderDetails.notes,
        paymentTerms: orderDetails.paymentTerms,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating order:', orderData);

      // 1. Create order in database
      const savedOrder = await DatabaseAdapter.createOrder(orderData);
      console.log('✅ Order saved to database:', savedOrder);
      console.log('🆔 Saved order ID:', savedOrder.orderId || savedOrder._id);
      console.log('📅 Saved order createdAt:', savedOrder.createdAt);

      // 2. Update inventory quantities for each item
      for (const item of orderItems) {
        try {
          console.log(`Updating inventory for ${item.partId}: reducing by ${item.quantity}`);
          await DatabaseAdapter.adjustStock(item.partId, -item.quantity, `Order ${orderData.orderId}`);
        } catch (invError) {
          console.warn(`Failed to update inventory for ${item.partId}:`, invError);
          // Continue with other items even if one fails
        }
      }

      // 3. Create corresponding invoice
      const invoiceData = {
        invoiceId: `INV${Date.now().toString().slice(-6)}`,
        order: savedOrder._id,
        customer: selectedCustomer._id || selectedCustomer.customerId,
        customerName: selectedCustomer.companyName,
        customerEmail: selectedCustomer.email,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
        items: orderItems.map(item => ({
          partId: item.partId,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity
        })),
        subtotal: calculateOrderTotal(),
        tax: calculateOrderTotal() * 0.08, // 8% tax
        totalAmount: calculateOrderTotal() * 1.08,
        status: 'Pending',
        paymentTerms: orderDetails.paymentTerms,
        notes: orderDetails.notes,
        createdAt: new Date()
      };

      console.log('Creating invoice:', invoiceData);
      const savedInvoice = await DatabaseAdapter.createInvoice(invoiceData);
      console.log('Invoice created:', savedInvoice);

      // 4. Create corresponding shipment
      const shipmentData = {
        shipmentId: `SHIP${Date.now().toString().slice(-6)}`,
        order: savedOrder._id,
        customer: selectedCustomer._id || selectedCustomer.customerId,
        customerName: selectedCustomer.companyName,
        items: orderItems.map(item => ({
          partId: item.partId,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity
        })),
        status: 'Processing',
        carrier: 'UPS',
        shippingAddress: orderDetails.shippingAddress,
        estimatedDelivery: orderDetails.estimatedDelivery ? new Date(orderDetails.estimatedDelivery) : null,
        shippingCost: calculateOrderTotal() * 0.05, // 5% of order value as shipping
        priority: orderDetails.priority,
        notes: orderDetails.notes,
        createdAt: new Date()
      };

      console.log('Creating shipment:', shipmentData);
      const savedShipment = await DatabaseAdapter.createShipment(shipmentData);
      console.log('Shipment created:', savedShipment);

      // 5. Process payment
      const paymentData = {
        paymentId: `PAY${Date.now().toString().slice(-6)}`,
        invoice: savedInvoice._id,
        order: savedOrder._id,
        customer: selectedCustomer._id || selectedCustomer.customerId,
        amount: savedInvoice.totalAmount,
        paymentMethod: 'Credit Card', // Default payment method
        status: 'Completed',
        processedAt: new Date(),
        notes: `Payment for order ${orderData.orderId}`,
        createdAt: new Date()
      };

      console.log('Processing payment:', paymentData);
      const paymentResult = await DatabaseAdapter.createPayment(paymentData);
      console.log('Payment processed:', paymentResult);

      // 6. Check for low stock notifications
      const lowStockNotifications = [];
      for (const item of orderItems) {
        try {
          const currentInventory = await DatabaseAdapter.getInventoryById(item.partId);
          if (currentInventory && currentInventory.inStock <= 3) {
            lowStockNotifications.push({
              partId: item.partId,
              partName: item.partName,
              currentStock: currentInventory.inStock,
              message: `${item.partName} is running low (${currentInventory.inStock} items remaining)`
            });
          }
        } catch (stockError) {
          console.warn(`Could not check stock for ${item.partId}:`, stockError);
        }
      }

      // Show success message with all details
      let successMessage = `Order ${orderData.orderId} has been placed successfully!\n\n` +
        `• Order saved to database\n` +
        `• Inventory quantities updated\n` +
        `• Invoice ${invoiceData.invoiceId} created\n` +
        `• Shipment ${shipmentData.shipmentId} created\n` +
        `• Payment processed (${paymentResult.status})\n\n`;

      if (lowStockNotifications.length > 0) {
        successMessage += `⚠️ Low Stock Alerts:\n`;
        lowStockNotifications.forEach(notification => {
          successMessage += `• ${notification.message}\n`;
        });
        successMessage += `\n`;
      }

      successMessage += `The order will appear in Order Management and Dashboard.`;

      Alert.alert(
        'Success! 🎉', 
        successMessage,
        [{ text: 'OK', style: 'default' }]
      );
      
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
      
      // Refresh recent orders list after a short delay to ensure database sync
      console.log('🔄 Refreshing recent orders after order placement...');
      console.log('⏰ Current time:', new Date().toLocaleString());
      setTimeout(async () => {
        console.log('⚡ Starting delayed refresh...');
        await fetchRecentOrders();
        console.log('✅ Delayed refresh completed');
        
        // Also try an immediate second refresh to see if there's a caching issue
        setTimeout(async () => {
          console.log('🔄 Second refresh attempt...');
          await fetchRecentOrders();
        }, 1000);
      }, 500); // 500ms delay to ensure database has synced

    } catch (error) {
      console.error('Failed to place order:', error);
      Alert.alert(
        'Error', 
        `Failed to place order: ${error.message}\n\nPlease try again or contact support.`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsPlacingOrder(false);
    }
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

      {/* Running Order Total - Shows as items are added */}
      {orderItems.length > 0 && (
        <View style={styles.runningTotalContainer}>
          <Text style={styles.runningTotalTitle}>Current Order</Text>
          
          {/* Item List with Totals */}
          <View style={styles.runningItemsList}>
            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.runningItemRow}>
                <View style={styles.runningItemInfo}>
                  <Text style={styles.runningItemName}>{item.partName}</Text>
                  <Text style={styles.runningItemDetails}>
                    ${parseFloat(item.unitPrice || 0).toFixed(2)} each
                  </Text>
                </View>
                
                {/* Quantity Controls */}
                <View style={styles.runningQuantityControls}>
                  <TouchableOpacity 
                    style={styles.runningQuantityButton}
                    onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.runningQuantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.runningQuantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.runningQuantityButton}
                    onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.runningQuantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.runningItemTotal}>
                  ${(parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                </Text>
                
                {/* Remove Button */}
                <TouchableOpacity 
                  style={styles.runningRemoveButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.runningRemoveButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Grand Total */}
          <View style={styles.runningGrandTotal}>
            <Text style={styles.runningGrandTotalLabel}>Total Amount</Text>
            <Text style={styles.runningGrandTotalAmount}>
              ${calculateOrderTotal().toFixed(2)}
            </Text>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.runningTotalActions}>
            <TouchableOpacity 
              style={styles.clearCartButton}
              onPress={() => setOrderItems([])}
            >
              <Text style={styles.clearCartButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.proceedOrderButton}
              onPress={() => setShowOrderModal(true)}
            >
              <Text style={styles.proceedOrderButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Orders Section */}
      <View style={styles.recentOrdersSection}>
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.recentOrdersTitle}>Recent Orders (Last 24 Hours)</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={async () => {
              console.log('🔄 Manual refresh button clicked');
              console.log('⏰ Manual refresh time:', new Date().toLocaleString());
              await fetchRecentOrders();
            }}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: '#dc3545', marginLeft: 10 }]}
            onPress={async () => {
              console.log('🐛 DEBUG: Checking ALL orders in database...');
              try {
                const allOrders = await DatabaseAdapter.getOrders();
                console.log('📊 Total orders in database:', allOrders.length);
                allOrders.forEach((order, index) => {
                  console.log(`Order ${index + 1}:`, {
                    id: order._id || order.id,
                    orderId: order.orderId,
                    createdAt: order.createdAt,
                    customerName: order.customerName
                  });
                });
              } catch (error) {
                console.error('❌ Error fetching all orders:', error);
              }
            }}
          >
            <Text style={styles.refreshButtonText}>🐛 Debug</Text>
          </TouchableOpacity>
        </View>
        
        {recentOrders.length > 0 ? (
          <View style={styles.recentOrdersList}>
            {recentOrders.map((order, index) => (
              <View key={order.id || index} style={styles.recentOrderItem}>
                <View style={styles.recentOrderHeader}>
                  <Text style={styles.recentOrderId}>Order #{order.orderId}</Text>
                  <Text style={styles.recentOrderDate}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.recentOrderCustomer}>
                  {order.customerName}
                </Text>
                <View style={styles.recentOrderDetails}>
                  <Text style={styles.recentOrderItems}>
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.recentOrderAmount}>
                    ${parseFloat(order.totalAmount || 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.recentOrderStatus, {
                    backgroundColor: order.status === 'Completed' ? '#28a745' : 
                                   order.status === 'Pending' ? '#ffc107' : '#dc3545'
                  }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noRecentOrders}>No orders placed in the last 24 hours</Text>
        )}
      </View>

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
                  <Text style={styles.itemUnitPrice}>Price: ${parseFloat(item.unitPrice || 0).toFixed(2)} each</Text>
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
              
              {/* Detailed Item Breakdown */}
              {orderItems.length > 0 && (
                <View style={styles.itemBreakdown}>
                  <Text style={styles.breakdownTitle}>Price Breakdown:</Text>
                  {orderItems.map((item, index) => (
                    <View key={item.id} style={styles.breakdownRow}>
                      <Text style={styles.breakdownItem}>
                        {item.partName} (×{item.quantity})
                      </Text>
                      <Text style={styles.breakdownPrice}>
                        ${(parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
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
            <TouchableOpacity 
              style={[styles.placeOrderButton, isPlacingOrder && styles.placeOrderButtonDisabled]} 
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              <Text style={styles.placeOrderButtonText}>
                {isPlacingOrder ? '🔄 Placing Order...' : 'Place Order'}
              </Text>
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
  itemUnitPrice: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 2,
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
  itemBreakdown: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownItem: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  breakdownPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'right',
  },
  // Running Total Styles
  runningTotalContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  runningTotalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
    textAlign: 'center',
  },
  runningItemsList: {
    marginBottom: 15,
  },
  runningItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  runningItemInfo: {
    flex: 1,
  },
  runningItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  runningItemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  runningItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    minWidth: 80,
    textAlign: 'right',
  },
  runningQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  runningQuantityButton: {
    backgroundColor: '#007bff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningQuantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  runningQuantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  runningRemoveButton: {
    backgroundColor: '#dc3545',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  runningRemoveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  runningGrandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#28a745',
    marginBottom: 15,
  },
  runningGrandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  runningGrandTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  runningTotalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearCartButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
  },
  clearCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proceedOrderButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
  },
  proceedOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
  placeOrderButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
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
  
  // Recent Orders Styles
  recentOrdersSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
  },
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentOrdersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noRecentOrders: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    padding: 20,
  },
  recentOrdersList: {
    gap: 12,
  },
  recentOrderItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  recentOrderDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  recentOrderCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recentOrderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentOrderItems: {
    fontSize: 12,
    color: '#6c757d',
  },
  recentOrderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  recentOrderStatus: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 60,
  },
});

export default PlaceOrder;