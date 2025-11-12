import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';

// Fallback data for when import fails
const fallbackOrdersData = [
  {
    id: 'ORD001',
    customerName: 'Sample Customer',
    customerEmail: 'sample@example.com',
    orderDate: '2025-11-11',
    status: 'Processing',
    priority: 'Medium',
    totalAmount: 1000.00,
    items: [
      { partId: 'AC001', partName: 'Sample Part', quantity: 1, unitPrice: 1000.00 }
    ],
    shippingAddress: '123 Sample St, City, State 12345',
    estimatedDelivery: '2025-11-15'
  }
];

let ordersData = fallbackOrdersData;
try {
  const { ordersData: importedOrdersData } = require('../data/shippingData');
  ordersData = importedOrdersData || fallbackOrdersData;
} catch (error) {
  console.warn('Failed to import orders data, using fallback data:', error);
  ordersData = fallbackOrdersData;
}

const Orders = () => {
  const [orders] = useState(ordersData);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateScreenData = () => {
      const newScreenData = Dimensions.get('window');
      setScreenData(newScreenData);
      setIsDesktop(newScreenData.width >= 768);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenData);
    updateScreenData();

    return () => subscription?.remove();
  }, []);

  const orderStatuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    const orderId = order.id || '';
    const customerName = order.customerName || '';
    const customerEmail = order.customerEmail || '';
    const orderStatus = order.status || '';
    
    const matchesSearch = orderId.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderStats = () => {
    const safeOrders = orders || [];
    return {
      total: safeOrders.length,
      pending: safeOrders.filter(o => o && o.status === 'Pending').length,
      processing: safeOrders.filter(o => o && o.status === 'Processing').length,
      shipped: safeOrders.filter(o => o && o.status === 'Shipped').length,
      delivered: safeOrders.filter(o => o && o.status === 'Delivered').length,
      totalValue: safeOrders.reduce((sum, o) => sum + (o && o.totalAmount ? o.totalAmount : 0), 0)
    };
  };

  const getOrderStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return '#4CAF50';
      case 'Shipped': return '#2196F3';
      case 'Processing': return '#FF9800';
      case 'Pending': return '#9C27B0';
      case 'Cancelled': return '#F44336';
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

  const stats = getOrderStats();
  const gridCols = Math.floor(screenData.width / 270);
  
  return (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
      </View>
      
      {/* Order Statistics */}
      {isDesktop ? (
        <View style={styles.desktopStatsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.processing}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.shipped}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${(stats.totalValue/1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsScrollContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.processing}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.shipped}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${(stats.totalValue/1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </ScrollView>
      )}

      {/* Search and Filter */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search orders by ID, customer name, or email..."
        value={orderSearchTerm}
        onChangeText={setOrderSearchTerm}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {orderStatuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.categoryButton, orderStatusFilter === status && styles.activeCategoryButton]}
            onPress={() => setOrderStatusFilter(status)}
          >
            <Text style={[styles.categoryText, orderStatusFilter === status && styles.activeCategoryText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filteredOrders.length} orders found</Text>

      {/* Orders List */}
      {filteredOrders.map(order => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.orderDate}>Ordered: {order.orderDate}</Text>
            </View>
            <View style={styles.orderStatusContainer}>
              <Text style={[styles.orderStatus, { color: getOrderStatusColor(order.status) }]}>
                {order.status}
              </Text>
              <Text style={[styles.orderPriority, { backgroundColor: getPriorityColor(order.priority) }]}>
                {order.priority}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderItems}>
            <Text style={styles.itemsTitle}>Items ({order.items.length}):</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>{item.partName}</Text>
                <Text style={styles.itemDetails}>
                  Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <View style={{ flex: 1, marginRight: 12, maxWidth: '70%' }}>
              <Text style={styles.totalAmount}>${order.totalAmount.toLocaleString()}</Text>
              {order.trackingNumber && (
                <Text style={styles.trackingNumber}>Tracking: {order.trackingNumber}</Text>
              )}
              {order.estimatedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <Text style={styles.deliveryDate}>Est. Delivery: {order.estimatedDelivery}</Text>
              )}
              {order.deliveredDate && (
                <Text style={styles.deliveredDate}>Delivered: {order.deliveredDate}</Text>
              )}
              {order.cancelReason && (
                <Text style={styles.cancelReason}>Cancelled: {order.cancelReason}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.orderActionButton}>
              <Text style={styles.orderActionText}>View Details</Text>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  desktopStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
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
    marginBottom: 15,
    minWidth: 140,
    flex: 1,
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderStatusContainer: {
    alignItems: 'flex-end',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderPriority: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  orderItems: {
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
  orderItem: {
    marginBottom: 6,
  },
  itemName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    minHeight: 60,
    position: 'relative',
    paddingRight: 100,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  trackingNumber: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
    fontWeight: '500',
  },
  deliveryDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  deliveredDate: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
  cancelReason: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 2,
    fontStyle: 'italic',
    flexWrap: 'wrap',
    lineHeight: 14,
  },
  orderActionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    position: 'absolute',
    right: 0,
    top: 8,
  },
  orderActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Orders;