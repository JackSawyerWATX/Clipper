import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Platform, TouchableOpacity, Alert } from 'react-native';
import DatabaseAdapter from '../services/DatabaseAdapter';

const Dashboard = ({ onPlaceNewOrder, onViewInventory, onManageCustomers, onViewReports }) => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    pendingInvoices: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading dashboard data...');

        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.warn('⚠️ Dashboard loading timeout - falling back to default data');
          setLoading(false);
        }, 10000); // 10 second timeout

        // Load orders
        console.log('📋 Loading orders...');
        const orders = await DatabaseAdapter.getOrders();
        console.log('✅ Dashboard orders loaded:', orders.length);

        // Load invoices
        console.log('🧾 Loading invoices...');
        const invoices = await DatabaseAdapter.getInvoices();
        console.log('✅ Dashboard invoices loaded:', invoices.length);

        // Load low stock items
        console.log('📦 Loading low stock items...');
        const lowStock = await DatabaseAdapter.getLowStock();
        console.log('⚠️ Low stock items found:', lowStock.length);
        setLowStockItems(lowStock);

        // Clear the timeout since we completed successfully
        clearTimeout(timeoutId);

        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;

        setDashboardData({
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalInvoices: invoices.length,
          pendingInvoices: pendingInvoices
        });

        console.log('🎉 Dashboard data updated successfully:', {
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalInvoices: invoices.length
        });

      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        console.error('Error details:', error.message);
        // Keep default values on error
      } finally {
        console.log('🏁 Dashboard loading complete');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.content, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
        <Text style={styles.loadingSubtext}>Fetching latest data from database</Text>
      </View>
    );
  }

  const handleQuickAction = (action) => {
    if (action === 'Place New Order' && onPlaceNewOrder) {
      onPlaceNewOrder();
      return;
    }
    if (action === 'View Inventory' && onViewInventory) {
      onViewInventory();
      return;
    }
    if (action === 'Manage Customers' && onManageCustomers) {
      onManageCustomers();
      return;
    }
    if (action === 'View Reports' && onViewReports) {
      onViewReports();
      return;
    }
    
    Alert.alert(
      'Quick Action', 
      `${action} feature will be available soon!\n\nFor now, use the navigation tabs to access these features.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Clipper Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${dashboardData.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.totalInvoices}</Text>
          <Text style={styles.statLabel}>Total Invoices</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.pendingInvoices}</Text>
          <Text style={styles.statLabel}>Pending Invoices</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleQuickAction('Place New Order')}
          >
            <Text style={styles.quickActionIcon}>📦</Text>
            <Text style={styles.quickActionText}>Place New Order</Text>
            <Text style={styles.quickActionSubtext}>Create order quickly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleQuickAction('View Inventory')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>View Inventory</Text>
            <Text style={styles.quickActionSubtext}>Check stock levels</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleQuickAction('Manage Customers')}
          >
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Manage Customers</Text>
            <Text style={styles.quickActionSubtext}>Customer database</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleQuickAction('View Reports')}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>View Reports</Text>
            <Text style={styles.quickActionSubtext}>Business analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analytics Section */}
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>📈 Quick Analytics</Text>
        
        <View style={styles.analyticsGrid}>
          {/* Revenue Trend */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>Revenue Trend</Text>
            <View style={styles.trendChart}>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '60%' }]} />
                <Text style={styles.trendLabel}>Mon</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '80%' }]} />
                <Text style={styles.trendLabel}>Tue</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '45%' }]} />
                <Text style={styles.trendLabel}>Wed</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '90%' }]} />
                <Text style={styles.trendLabel}>Thu</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '75%' }]} />
                <Text style={styles.trendLabel}>Fri</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '85%' }]} />
                <Text style={styles.trendLabel}>Sat</Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { height: '70%' }]} />
                <Text style={styles.trendLabel}>Sun</Text>
              </View>
            </View>
            <Text style={styles.analyticsValue}>${dashboardData.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.analyticsSubtext}>This week</Text>
          </View>

          {/* Order Status Distribution */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>Order Status</Text>
            <View style={styles.statusChart}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Processing: {Math.floor(dashboardData.totalOrders * 0.6)}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.statusText}>Shipped: {Math.floor(dashboardData.totalOrders * 0.3)}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.statusText}>Delivered: {Math.floor(dashboardData.totalOrders * 0.1)}</Text>
              </View>
            </View>
            <Text style={styles.analyticsValue}>{dashboardData.totalOrders}</Text>
            <Text style={styles.analyticsSubtext}>Total orders</Text>
          </View>

          {/* Top Suppliers Performance */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>Top Suppliers</Text>
            <View style={styles.supplierList}>
              <View style={styles.supplierItem}>
                <Text style={styles.supplierRank}>1</Text>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>Pratt & Whitney</Text>
                  <Text style={styles.supplierMetric}>45 orders</Text>
                </View>
              </View>
              <View style={styles.supplierItem}>
                <Text style={styles.supplierRank}>2</Text>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>Honeywell</Text>
                  <Text style={styles.supplierMetric}>52 orders</Text>
                </View>
              </View>
              <View style={styles.supplierItem}>
                <Text style={styles.supplierRank}>3</Text>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>GE Aviation</Text>
                  <Text style={styles.supplierMetric}>48 orders</Text>
                </View>
              </View>
            </View>
            <Text style={styles.analyticsValue}>4.7</Text>
            <Text style={styles.analyticsSubtext}>Avg rating</Text>
          </View>

          {/* Inventory Health */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>Inventory Health</Text>
            <View style={styles.inventoryChart}>
              <View style={styles.inventoryBar}>
                <View style={[styles.inventoryFill, { width: '75%', backgroundColor: '#4CAF50' }]} />
                <Text style={styles.inventoryLabel}>In Stock</Text>
              </View>
              <View style={styles.inventoryBar}>
                <View style={[styles.inventoryFill, { width: '15%', backgroundColor: '#FF9800' }]} />
                <Text style={styles.inventoryLabel}>Low Stock</Text>
              </View>
              <View style={styles.inventoryBar}>
                <View style={[styles.inventoryFill, { width: '10%', backgroundColor: '#F44336' }]} />
                <Text style={styles.inventoryLabel}>Out of Stock</Text>
              </View>
            </View>
            <Text style={styles.analyticsValue}>{lowStockItems.length}</Text>
            <Text style={styles.analyticsSubtext}>Items need attention</Text>
          </View>
        </View>
      </View>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>⚠️ Low Stock Alerts</Text>
          <ScrollView style={styles.alertsList}>
            {lowStockItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertContent}>
                  <Text style={styles.alertItemName}>{item.name}</Text>
                  <Text style={styles.alertItemDetails}>
                    Stock: {item.inStock} | Minimum: {item.minimumStock || 10}
                  </Text>
                </View>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>LOW</Text>
                </View>
              </View>
            ))}
            {lowStockItems.length > 5 && (
              <Text style={styles.moreItemsText}>
                + {lowStockItems.length - 5} more items need attention
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Quick Actions styles
  quickActionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#f8f9fa',
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Low Stock Alerts styles
  alertsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  alertContent: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  alertItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  alertBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreItemsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },

  // Analytics styles
  analyticsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    backgroundColor: '#f8f9fa',
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 10,
  },
  analyticsSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Trend chart styles
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 10,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  trendFill: {
    width: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    marginBottom: 5,
  },
  trendLabel: {
    fontSize: 10,
    color: '#666',
  },

  // Status chart styles
  statusChart: {
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#333',
  },

  // Supplier list styles
  supplierList: {
    marginBottom: 10,
  },
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  supplierRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    width: 20,
    textAlign: 'center',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  supplierMetric: {
    fontSize: 10,
    color: '#666',
  },

  // Inventory chart styles
  inventoryChart: {
    marginBottom: 10,
  },
  inventoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inventoryFill: {
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  inventoryLabel: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
});

export default Dashboard;