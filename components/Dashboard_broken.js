import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Platform } from 'react-native';
import { aircraftPartsInventory, getLowStockParts, getTotalInventoryValue } from '../data/aircraftInventory';
import { shipmentsData } from '../data/shippingData';
import responsiveManager from '../utils/ResponsiveManager';
import DatabaseAdapter from '../services/DatabaseAdapter';

const Dashboard = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    lowStockParts: getLowStockParts(),
    totalInventoryValue: getTotalInventoryValue(),
    recentOrders: []
  });
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

        // Load inventory for updated calculations
        console.log('📦 Loading inventory...');
        const inventory = await DatabaseAdapter.getInventory();
        console.log('✅ Dashboard inventory loaded:', inventory.length);

        // Clear the timeout since we completed successfully
        clearTimeout(timeoutId);

        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
        const recentOrders = orders.slice(0, 5); // Show 5 most recent

        setDashboardData({
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalInvoices: invoices.length,
          pendingInvoices: pendingInvoices,
          lowStockParts: getLowStockParts(), // Keep existing function
          totalInventoryValue: getTotalInventoryValue(), // Keep existing function
          recentOrders: recentOrders
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

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const isDesktop = screenData.width >= 1024;
  const isTablet = screenData.width >= 768 && screenData.width < 1024;
  const isMobile = screenData.width < 768;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return '#4CAF50';
      case 'In Transit': return '#FF9800';
      case 'Processing': return '#2196F3';
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

  const renderStatsGrid = () => {
    const statsData = [
      { number: aircraftPartsInventory.length, label: 'Parts in Stock', color: '#2196F3' },
      { number: dashboardData.totalOrders, label: 'Total Orders', color: '#FF9800' },
      { number: dashboardData.lowStockParts.length, label: 'Low Stock Alerts', color: '#F44336' },
      { number: `$${dashboardData.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: '#4CAF50' }
    ];

    if (isDesktop) {
      return (
        <View style={styles.desktopStatsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={[styles.desktopStatCard, { borderLeftColor: stat.color }]}>
              <Text style={[styles.desktopStatNumber, { color: stat.color }]}>{stat.number}</Text>
              <Text style={styles.desktopStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsScrollContainer}
        >
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statNumber, { color: stat.color }]}>{stat.number}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>
      );
    }
  };

  // TEMPORARY: Simple test version to debug loading issue
  return (
    <View style={[styles.content, { padding: 20 }]}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        🎉 Dashboard Loaded Successfully!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Loading State: {loading ? 'Loading...' : 'Complete'}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Orders: {dashboardData.totalOrders}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Revenue: ${dashboardData.totalRevenue.toLocaleString()}
      </Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        If you see this message, the Dashboard component is working and the issue was likely with database loading or complex rendering.
      </Text>
    </View>
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
  valueCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  valueLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  alertCard: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  partStock: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 2,
  },
  partPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  shipmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shipmentPriority: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  estimatedDate: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  deliveredDateShipment: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  destination: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inRouteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inRouteCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inRouteTracking: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inRouteStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inRouteStatusText: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
  },
  inRouteDestination: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
  },
  inRouteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inRouteCarrier: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inRouteItems: {
    fontSize: 10,
    color: '#666',
  },
  inRouteEta: {
    fontSize: 9,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  // Desktop Specific Styles
  desktopContent: {
    padding: 0,
  },
  desktopStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  desktopStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 25,
    marginHorizontal: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  desktopStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desktopStatLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
});

export default Dashboard;