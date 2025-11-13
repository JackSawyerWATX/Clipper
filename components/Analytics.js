import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import DatabaseAdapter from '../services/DatabaseAdapter';

const { width } = Dimensions.get('window');

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'monthly', 'weekly', 'daily'

  useEffect(() => {
    loadAnalyticsData();
  }, [timePeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data from various sources
      const [suppliers, customers, orders, shipments, inventory] = await Promise.all([
        DatabaseAdapter.getSuppliers(),
        DatabaseAdapter.getCustomers(),
        DatabaseAdapter.getOrders(),
        DatabaseAdapter.getShipments(),
        DatabaseAdapter.getInventory()
      ]);

      // Process analytics data
      const processedData = processAnalyticsData(suppliers, customers, orders, shipments, inventory);
      setAnalyticsData(processedData);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
      // Fallback to sample data
      setAnalyticsData(generateSampleData());
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (suppliers, customers, orders, shipments, inventory) => {
    // Calculate financial metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate shipment metrics
    const shipmentStats = {
      processing: shipments.filter(s => s.status === 'Processing').length,
      pending: shipments.filter(s => s.status === 'Pending').length,
      shipped: shipments.filter(s => s.status === 'Shipped').length,
      inTransit: shipments.filter(s => s.status === 'In Transit').length,
      delivered: shipments.filter(s => s.status === 'Delivered').length,
      total: shipments.length
    };
    shipmentStats.inRoute = shipmentStats.shipped + shipmentStats.inTransit;

    // Calculate supplier performance
    const supplierPerformance = suppliers.map(supplier => ({
      name: supplier.companyName,
      orders: supplier.totalOrders || 0,
      rating: supplier.reliabilityRating || 0,
      deliveryTime: supplier.deliveryTime || 'N/A'
    })).sort((a, b) => b.orders - a.orders).slice(0, 5);

    // Calculate inventory metrics
    const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.inStock || 0) * (item.unitPrice || 0)), 0);
    const lowStockItems = inventory.filter(item => (item.inStock || 0) <= (item.minimumStock || 10)).length;
    const outOfStockItems = inventory.filter(item => (item.inStock || 0) === 0).length;

    // Generate year-to-date data
    const yearToDateData = generateYearToDateData();

    return {
      financial: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        yearToDate: yearToDateData.financial
      },
      shipments: {
        ...shipmentStats,
        yearToDate: yearToDateData.shipments
      },
      suppliers: supplierPerformance,
      inventory: {
        totalValue: totalInventoryValue,
        lowStockItems,
        outOfStockItems,
        totalItems: inventory.length
      },
      customers: {
        total: customers.length,
        active: customers.filter(c => c.status === 'Active').length,
        yearToDate: yearToDateData.customers
      },
      timeLabels: yearToDateData.labels
    };
  };

  const generateYearToDateData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Generate labels based on time period
    const generateLabels = (period) => {
      const labels = [];
      if (period === 'monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i <= currentMonth; i++) {
          labels.push(monthNames[i]);
        }
      } else if (period === 'weekly') {
        const weeksInYear = Math.ceil((new Date() - new Date(currentYear, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        for (let i = 1; i <= weeksInYear; i++) {
          labels.push(`W${i}`);
        }
      } else if (period === 'daily') {
        const daysInYear = Math.ceil((new Date() - new Date(currentYear, 0, 1)) / (24 * 60 * 60 * 1000));
        for (let i = 1; i <= Math.min(daysInYear, 30); i++) { // Limit to last 30 days for daily view
          labels.push(`D${i}`);
        }
      }
      return labels;
    };

    const labels = generateLabels(timePeriod);

    // Generate sample year-to-date data (in real app, this would come from historical data)
    const generateTrendData = (baseValue, variance = 0.2, count) => {
      const data = [];
      for (let i = 0; i < count; i++) {
        const trend = 1 + (i / count) * 0.3; // Upward trend
        const randomVariance = 1 + (Math.random() - 0.5) * variance;
        data.push(Math.round(baseValue * trend * randomVariance));
      }
      return data;
    };

    return {
      labels,
      financial: {
        revenue: generateTrendData(75000, 0.15, labels.length),
        orders: generateTrendData(8, 0.25, labels.length)
      },
      shipments: {
        total: generateTrendData(12, 0.2, labels.length),
        delivered: generateTrendData(8, 0.3, labels.length),
        inTransit: generateTrendData(3, 0.4, labels.length)
      },
      customers: {
        new: generateTrendData(2, 0.5, labels.length),
        active: generateTrendData(35, 0.1, labels.length)
      }
    };
  };

  const generateSampleData = () => {
    const yearToDateData = generateYearToDateData();
    return {
      financial: {
        totalRevenue: 1089000,
        totalOrders: 102,
        avgOrderValue: 10676.47,
        yearToDate: yearToDateData.financial
      },
      shipments: {
        processing: 3,
        pending: 2,
        shipped: 4,
        inTransit: 2,
        delivered: 1,
        total: 12,
        inRoute: 6,
        yearToDate: yearToDateData.shipments
      },
      suppliers: [
        { name: 'Pratt & Whitney', orders: 45, rating: 4.8 },
        { name: 'Honeywell', orders: 52, rating: 4.7 },
        { name: 'GE Aviation', orders: 48, rating: 4.8 },
        { name: 'Rolls-Royce', orders: 29, rating: 4.6 },
        { name: 'Garmin', orders: 41, rating: 4.9 }
      ],
      inventory: {
        totalValue: 2450000,
        lowStockItems: 8,
        outOfStockItems: 3,
        totalItems: 156
      },
      customers: {
        total: 45,
        active: 42,
        yearToDate: yearToDateData.customers
      },
      timeLabels: yearToDateData.labels
    };
  };

  // Time Period Selector Component
  const TimePeriodSelector = () => (
    <View style={styles.timePeriodContainer}>
      <Text style={styles.timePeriodLabel}>Time Period:</Text>
      <View style={styles.timePeriodButtons}>
        {[
          { key: 'monthly', label: 'Monthly' },
          { key: 'weekly', label: 'Weekly' },
          { key: 'daily', label: 'Daily (30d)' }
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.timePeriodButton,
              timePeriod === period.key && styles.timePeriodButtonActive
            ]}
            onPress={() => setTimePeriod(period.key)}
          >
            <Text style={[
              styles.timePeriodButtonText,
              timePeriod === period.key && styles.timePeriodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Line Graph Component
  const LineGraph = ({ title, data, color, unit = '', months }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>{title}</Text>
        <View style={styles.graphContainer}>
          <View style={styles.lineGraph}>
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * (width * 0.7 - 40);
              const y = 120 - ((value - minValue) / range) * 100;
              
              return (
                <View key={index}>
                  {/* Data point */}
                  <View 
                    style={[
                      styles.dataPoint, 
                      { 
                        left: x + 20,
                        top: y - 5,
                        backgroundColor: color,
                        borderColor: color,
                      }
                    ]}
                  >
                    <View style={[styles.dataPointFill, { backgroundColor: color }]} />
                  </View>
                  
                  {/* Value label */}
                  <Text style={[styles.dataPointLabel, { left: x + 15, top: y - 25 }]}>
                    {unit}{value.toLocaleString()}
                  </Text>
                  
                  {/* Month label */}
                  {months && months[index] && (
                    <Text style={[styles.monthLabel, { left: x + 10, top: 130 }]}>
                      {months[index]}
                    </Text>
                  )}
                </View>
              );
            })}
            
            {/* Connecting lines */}
            <View style={styles.lineContainer}>
              {data.map((value, index) => {
                if (index === 0) return null;
                const prevValue = data[index - 1];
                const prevX = ((index - 1) / (data.length - 1)) * (width * 0.7 - 40) + 20;
                const prevY = 120 - ((prevValue - minValue) / range) * 100;
                const currX = (index / (data.length - 1)) * (width * 0.7 - 40) + 20;
                const currY = 120 - ((value - minValue) / range) * 100;
                
                const distance = Math.sqrt(Math.pow(currX - prevX, 2) + Math.pow(currY - prevY, 2));
                const angle = Math.atan2(currY - prevY, currX - prevX) * 180 / Math.PI;
                
                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.lineSegment,
                      {
                        left: prevX,
                        top: prevY,
                        width: distance,
                        height: 2,
                        backgroundColor: color,
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: '0 0',
                      }
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Shipment Status Chart
  const ShipmentChart = ({ shipmentStats }) => {
    if (!shipmentStats) return null;

    return (
      <View style={styles.shipmentChartCard}>
        <Text style={styles.graphTitle}>Shipment Status Distribution</Text>
        <View style={styles.shipmentBars}>
          {[
            { label: 'Processing', count: shipmentStats.processing, color: '#9C27B0' },
            { label: 'Pending', count: shipmentStats.pending, color: '#757575' },
            { label: 'Shipped', count: shipmentStats.shipped, color: '#2196F3' },
            { label: 'In Transit', count: shipmentStats.inTransit, color: '#FF9800' },
            { label: 'Delivered', count: shipmentStats.delivered, color: '#4CAF50' },
          ].map((item, index) => {
            const percentage = shipmentStats.total > 0 ? (item.count / shipmentStats.total) * 100 : 0;
            const barHeight = shipmentStats.total > 0 ? (item.count / shipmentStats.total) * 120 + 20 : 20;
            
            return (
              <View key={index} style={styles.shipmentBar}>
                <View 
                  style={[
                    styles.shipmentBarFill, 
                    { 
                      height: barHeight, 
                      backgroundColor: item.color,
                      shadowColor: item.color,
                    }
                  ]} 
                />
                <Text style={styles.shipmentBarLabel}>{item.label}</Text>
                <Text style={styles.shipmentBarCount}>{item.count}</Text>
                <Text style={styles.shipmentBarPercent}>{percentage.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.shipmentSummary}>
          <Text style={styles.summaryText}>Total Shipments: {shipmentStats.total}</Text>
          <Text style={styles.summaryText}>In Route: {shipmentStats.inRoute}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
        <Text style={styles.loadingSubtext}>Fetching business intelligence data</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubtext}>Using sample data for demonstration</Text>
      </View>
    );
  }

  if (!analyticsData) return null;

  const { financial, shipments, suppliers, inventory, customers, timeLabels } = analyticsData;

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Analytics & Insights</Text>

      {/* Time Period Selector */}
      <TimePeriodSelector />

      {/* Financial Metrics */}
      <Text style={styles.sectionTitle}>📈 Financial Performance</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphSection}>
        <LineGraph
          title={`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Revenue`}
          data={financial.yearToDate.revenue}
          color="#4CAF50"
          unit="$"
          months={timeLabels}
        />
        <LineGraph
          title={`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Orders`}
          data={financial.yearToDate.orders}
          color="#2196F3"
          months={timeLabels}
        />
      </ScrollView>

      {/* Customer Analytics */}
      <Text style={styles.sectionTitle}>👥 Customer Analytics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphSection}>
        <LineGraph
          title={`New Customers (${timePeriod})`}
          data={customers.yearToDate.new}
          color="#9C27B0"
          months={timeLabels}
        />
        <LineGraph
          title={`Active Customers (${timePeriod})`}
          data={customers.yearToDate.active}
          color="#FF9800"
          months={timeLabels}
        />
      </ScrollView>

      {/* Shipment Analytics */}
      <Text style={styles.sectionTitle}>🚚 Shipment Analytics</Text>
      <View style={styles.shipmentAnalyticsContainer}>
        <ShipmentChart shipmentStats={shipments} />
        <View style={styles.shipmentTrendsContainer}>
          <Text style={styles.trendsTitle}>Shipment Trends ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendsSection}>
            <LineGraph
              title="Total Shipments"
              data={shipments.yearToDate.total}
              color="#2196F3"
              months={timeLabels}
            />
            <LineGraph
              title="Delivered"
              data={shipments.yearToDate.delivered}
              color="#4CAF50"
              months={timeLabels}
            />
            <LineGraph
              title="In Transit"
              data={shipments.yearToDate.inTransit}
              color="#FF9800"
              months={timeLabels}
            />
          </ScrollView>
        </View>
      </View>

      {/* Supplier Performance */}
      <Text style={styles.sectionTitle}>🏭 Supplier Performance</Text>
      <View style={styles.supplierPerformanceCard}>
        <Text style={styles.supplierTitle}>Top Performing Suppliers</Text>
        <View style={styles.supplierList}>
          {suppliers.slice(0, 3).map((supplier, index) => (
            <View key={index} style={styles.supplierItem}>
              <View style={styles.supplierRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.supplierDetails}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierStats}>
                  {supplier.orders} orders • {supplier.rating}★ rating
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Inventory Analytics */}
      <Text style={styles.sectionTitle}>📦 Inventory Analytics</Text>
      <View style={styles.inventoryAnalyticsCard}>
        <View style={styles.inventoryMetric}>
          <Text style={styles.inventoryValue}>${inventory.totalValue.toLocaleString()}</Text>
          <Text style={styles.inventoryLabel}>Total Inventory Value</Text>
        </View>
        <View style={styles.inventoryStats}>
          <View style={styles.inventoryStat}>
            <Text style={styles.inventoryStatNumber}>{inventory.totalItems}</Text>
            <Text style={styles.inventoryStatLabel}>Total Items</Text>
          </View>
          <View style={styles.inventoryStat}>
            <Text style={styles.inventoryStatNumber}>{inventory.lowStockItems}</Text>
            <Text style={styles.inventoryStatLabel}>Low Stock</Text>
          </View>
          <View style={styles.inventoryStat}>
            <Text style={styles.inventoryStatNumber}>{inventory.outOfStockItems}</Text>
            <Text style={styles.inventoryStatLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      {/* Key Performance Indicators */}
      <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>${(financial.totalRevenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
          <Text style={styles.kpiTrend}>+18.2% vs last month</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{financial.totalOrders}</Text>
          <Text style={styles.kpiLabel}>Total Orders</Text>
          <Text style={styles.kpiTrend}>Active pipeline</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{shipments.inRoute}</Text>
          <Text style={styles.kpiLabel}>Active Shipments</Text>
          <Text style={styles.kpiTrend}>{shipments.total} total managed</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{customers.active}</Text>
          <Text style={styles.kpiLabel}>Active Customers</Text>
          <Text style={styles.kpiTrend}>{customers.total} total registered</Text>
        </View>
      </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  graphSection: {
    marginBottom: 20,
  },
  graphCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  graph3D: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    width: '100%',
    paddingHorizontal: 10,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dataPointFill: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  dataPointLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 40,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    minWidth: 30,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    backgroundColor: '#007bff',
  },
  lineGraph: {
    width: width * 0.7,
    height: 160,
    position: 'relative',
  },

  // Shipment Chart styles
  shipmentChartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  shipmentBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 15,
  },
  shipmentBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  shipmentBarFill: {
    width: 30,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  shipmentBarLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  shipmentBarCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  shipmentBarPercent: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  shipmentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
  },
  bar3D: {
    width: 25,
    borderRadius: 4,
    marginBottom: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 9,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 1,
  },
  graphStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  shipmentChartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  shipmentBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  shipmentBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  shipmentBarFill: {
    width: 30,
    borderRadius: 4,
    marginBottom: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  shipmentBarLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  shipmentBarCount: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 1,
  },
  shipmentBarPercent: {
    fontSize: 8,
    color: '#666',
    marginTop: 1,
  },
  shipmentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  kpiTrend: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },

  // Loading and Error styles
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
    marginTop: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },

  // Supplier Performance styles
  supplierPerformanceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  supplierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  supplierList: {
    marginBottom: 10,
  },
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  supplierRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  supplierDetails: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  supplierStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Inventory Analytics styles
  inventoryAnalyticsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  inventoryMetric: {
    alignItems: 'center',
    marginBottom: 15,
  },
  inventoryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  inventoryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inventoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  inventoryStat: {
    alignItems: 'center',
  },
  inventoryStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inventoryStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Time Period Selector styles
  timePeriodContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timePeriodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timePeriodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePeriodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 2,
    alignItems: 'center',
  },
  timePeriodButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  timePeriodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timePeriodButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Shipment Analytics Container styles
  shipmentAnalyticsContainer: {
    marginBottom: 20,
  },
  shipmentTrendsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  trendsSection: {
    marginBottom: 10,
  },
});

export default Analytics;