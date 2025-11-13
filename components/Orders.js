import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import DatabaseAdapter from '../services/DatabaseAdapter';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Orders Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#e74c3c', marginBottom: 10 }}>
            ⚠️ Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

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

const Orders = () => {
  const [orders, setOrders] = useState(fallbackOrdersData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isDesktop, setIsDesktop] = useState(false);

  // Load orders from database
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading orders from database...');
        
        // Initialize DatabaseAdapter first
        await DatabaseAdapter.initialize();
        
        const dbOrders = await DatabaseAdapter.getOrders();
        console.log('Loaded orders:', dbOrders);
        
        if (dbOrders && Array.isArray(dbOrders) && dbOrders.length > 0) {
          setOrders(dbOrders);
        } else {
          console.log('No orders found in database, using fallback data');
          // Keep fallback data
        }
      } catch (error) {
        console.error('Failed to load orders from database:', error);
        console.error('Error details:', error.message);
        setError(`Failed to load orders: ${error.message}`);
        // Keep fallback data if database fails
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

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
    if (!order || typeof order !== 'object') return false;
    const orderId = (order.id || order.orderId || '').toString().toLowerCase();
    const customerName = (order.customerName || '').toString().toLowerCase();
    const customerEmail = (order.customerEmail || '').toString().toLowerCase();
    const orderStatus = (order.status || '').toString();
    
    const matchesSearch = !orderSearchTerm || 
                         orderId.includes(orderSearchTerm.toLowerCase()) ||
                         customerName.includes(orderSearchTerm.toLowerCase()) ||
                         customerEmail.includes(orderSearchTerm.toLowerCase());
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

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Showing cached data</Text>
        </View>
      )}

      {/* Loading Display */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      )}
      
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
              <Text style={styles.orderDate}>
                Ordered: {order.orderDate instanceof Date
                  ? order.orderDate.toLocaleDateString()
                  : (typeof order.orderDate === 'string' ? order.orderDate : '')}
              </Text>
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
                  Qty: {item.quantity} × $
                  {typeof item.unitPrice === 'number' && !isNaN(item.unitPrice)
                    ? item.unitPrice.toLocaleString()
                    : 'N/A'}
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
                <Text style={styles.deliveryDate}>
                  Est. Delivery: {order.estimatedDelivery instanceof Date
                    ? order.estimatedDelivery.toLocaleDateString()
                    : (typeof order.estimatedDelivery === 'string' ? order.estimatedDelivery : '')}
                </Text>
              )}
              {order.deliveredDate && (
                <Text style={styles.deliveredDate}>
                  Delivered: {order.deliveredDate instanceof Date
                    ? order.deliveredDate.toLocaleDateString()
                    : (typeof order.deliveredDate === 'string' ? order.deliveredDate : '')}
                </Text>
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
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#856404',
  },
  loadingContainer: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
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

// Wrap Orders component with Error Boundary
const OrdersWithErrorBoundary = () => (
  <ErrorBoundary>
    <Orders />
  </ErrorBoundary>
);

export default OrdersWithErrorBoundary;