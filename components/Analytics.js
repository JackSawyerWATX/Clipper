import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { ordersData, shipmentsData } from '../data/shippingData';
import { customersData } from '../data/customersData';

const { width } = Dimensions.get('window');

const Analytics = () => {
  // Generate sample data for 3D line graphs (last 6 months)
  const generateMonthlyData = () => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return {
      sales: [145000, 167000, 189000, 156000, 198000, 234000],
      profit: [32000, 41000, 47000, 38000, 52000, 61000],
      overhead: [28000, 31000, 29000, 33000, 35000, 37000],
      newCustomers: [3, 5, 2, 4, 6, 3],
      retention: [87, 89, 91, 88, 93, 95],
      months
    };
  };

  const data = generateMonthlyData();

  // Calculate shipment status distribution
  const getShipmentStats = () => {
    const stats = {
      processing: shipmentsData.filter(s => s.status === 'Processing').length,
      pending: shipmentsData.filter(s => s.status === 'Pending').length,
      shipped: shipmentsData.filter(s => s.status === 'Shipped').length,
      inTransit: shipmentsData.filter(s => s.status === 'In Transit').length,
      delivered: shipmentsData.filter(s => s.status === 'Delivered').length,
      total: shipmentsData.length
    };
    stats.inRoute = stats.shipped + stats.inTransit;
    return stats;
  };

  const shipmentStats = getShipmentStats();

  // 3D Line Graph Component (simplified visual representation)
  const LineGraph = ({ title, data, color, unit = '' }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;

    return (
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>{title}</Text>
        <View style={styles.graphContainer}>
          <View style={styles.graph3D}>
            {data.map((value, index) => {
              const height = range > 0 ? ((value - minValue) / range) * 120 + 20 : 70;
              return (
                <View key={index} style={styles.dataPoint}>
                  <View 
                    style={[
                      styles.bar3D, 
                      { 
                        height, 
                        backgroundColor: color,
                        shadowColor: color,
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{generateMonthlyData().months[index]}</Text>
                  <Text style={styles.barValue}>{unit}{value.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.graphStats}>
          <Text style={styles.statText}>Peak: {unit}{maxValue.toLocaleString()}</Text>
          <Text style={styles.statText}>Current: {unit}{data[data.length - 1].toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  // Shipment Status Chart
  const ShipmentChart = () => (
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
          const percentage = (item.count / shipmentStats.total) * 100;
          const barHeight = (item.count / shipmentStats.total) * 120 + 20;
          
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

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Analytics & Insights</Text>
      
      {/* Financial Metrics */}
      <Text style={styles.sectionTitle}>📈 Financial Performance</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphSection}>
        <LineGraph 
          title="Monthly Sales" 
          data={data.sales} 
          color="#4CAF50" 
          unit="$" 
        />
        <LineGraph 
          title="Profit Margins" 
          data={data.profit} 
          color="#2196F3" 
          unit="$" 
        />
        <LineGraph 
          title="Overhead Costs" 
          data={data.overhead} 
          color="#F44336" 
          unit="$" 
        />
      </ScrollView>

      {/* Customer Metrics */}
      <Text style={styles.sectionTitle}>👥 Customer Analytics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphSection}>
        <LineGraph 
          title="New Customers" 
          data={data.newCustomers} 
          color="#9C27B0" 
        />
        <LineGraph 
          title="Retention Rate" 
          data={data.retention} 
          color="#FF9800" 
          unit="%" 
        />
      </ScrollView>

      {/* Shipment Analytics */}
      <Text style={styles.sectionTitle}>🚚 Shipment Analytics</Text>
      <ShipmentChart />

      {/* Key Performance Indicators */}
      <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>${(data.sales[5] / 1000).toFixed(0)}K</Text>
          <Text style={styles.kpiLabel}>Monthly Revenue</Text>
          <Text style={styles.kpiTrend}>+18.2% vs last month</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{data.retention[5]}%</Text>
          <Text style={styles.kpiLabel}>Customer Retention</Text>
          <Text style={styles.kpiTrend}>+2.1% vs last month</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{shipmentStats.inRoute}</Text>
          <Text style={styles.kpiLabel}>Active Shipments</Text>
          <Text style={styles.kpiTrend}>{shipmentStats.total} total managed</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{customersData.length}</Text>
          <Text style={styles.kpiLabel}>Active Customers</Text>
          <Text style={styles.kpiTrend}>Growing network</Text>
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
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
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
});

export default Analytics;