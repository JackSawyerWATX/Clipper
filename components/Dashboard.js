import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Platform, TouchableOpacity, Alert } from 'react-native';
import DatabaseAdapter from '../services/DatabaseAdapter';

const Dashboard = () => {
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
    Alert.alert(
      'Quick Action', 
      `${action} feature will be available soon!\n\nFor now, use the navigation tabs to access these features.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>🎉 Dashboard Loaded Successfully!</Text>
      
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});

export default Dashboard;