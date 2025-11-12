import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert, Platform } from 'react-native';

// Import Web-compatible components
import WebAlert from '../utils/WebAlert';
import Modal from './Modal';

// Use web-compatible Alert
const Alert = Platform.OS === 'web' ? WebAlert : RNAlert;
import securityManager from '../security/SecurityManager';
import secureDataAccess from '../security/SecureDataAccess';

const SecurityDashboard = ({ visible, onClose }) => {
  const [securityStatus, setSecurityStatus] = useState({});
  const [accessSummary, setAccessSummary] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [selectedTab, setSelectedTab] = useState('status');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSecurityData();
    }
  }, [visible]);

  const loadSecurityData = async () => {
    try {
      setRefreshing(true);
      
      // Get security status
      const status = securityManager.getSecurityStatus();
      setSecurityStatus(status);

      // Get access summary
      const summary = secureDataAccess.getAccessSummary();
      setAccessSummary(summary);

      // Get audit log if user has permission
      try {
        const log = securityManager.getAuditLog();
        setAuditLog(log.slice(-20)); // Show last 20 events
      } catch (error) {
        setAuditLog([]);
      }
    } catch (error) {
      Alert.alert('Security Error', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmergencyLockdown = () => {
    Alert.alert(
      'Emergency Lockdown',
      'This will immediately terminate all sessions and lock access to all data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lockdown',
          style: 'destructive',
          onPress: () => {
            try {
              secureDataAccess.emergencyLockdown();
            } catch (error) {
              Alert.alert('Lockdown Activated', 'System is now in lockdown mode.');
              onClose();
            }
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and require fresh authentication. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            secureDataAccess.clearCache();
            Alert.alert('Success', 'Cache cleared successfully');
            loadSecurityData();
          }
        }
      ]
    );
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'Expired';
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    return status ? '#4CAF50' : '#F44336';
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'super_admin': return '#9C27B0';
      case 'admin': return '#FF5722';
      case 'user': return '#2196F3';
      case 'guest': return '#9E9E9E';
      default: return '#666';
    }
  };

  const renderStatusTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>🔐 Session Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Authentication:</Text>
          <View style={[styles.statusIndicator, 
            { backgroundColor: getStatusColor(securityStatus.isAuthenticated) }]} />
          <Text style={[styles.statusText, 
            { color: getStatusColor(securityStatus.isAuthenticated) }]}>
            {securityStatus.isAuthenticated ? 'Active' : 'Inactive'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Access Level:</Text>
          <View style={[styles.accessBadge, 
            { backgroundColor: getAccessLevelColor(securityStatus.accessLevel) }]}>
            <Text style={styles.accessText}>
              {securityStatus.accessLevel?.toUpperCase() || 'GUEST'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Session Active:</Text>
          <Text style={styles.statusValue}>
            {securityStatus.sessionActive ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Time Until Expiry:</Text>
          <Text style={[styles.statusValue, 
            { color: securityStatus.timeUntilExpiry < 300000 ? '#F44336' : '#666' }]}>
            {formatTime(securityStatus.timeUntilExpiry)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last Activity:</Text>
          <Text style={styles.statusValue}>
            {securityStatus.lastActivity ? 
              formatDate(securityStatus.lastActivity) : 'Never'}
          </Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>🛡️ Data Protection</Text>
        <View style={styles.protectionGrid}>
          <View style={styles.protectionItem}>
            <Text style={styles.protectionLabel}>Encryption</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={styles.protectionItem}>
            <Text style={styles.protectionLabel}>Audit Log</Text>
            <Text style={styles.protectionValue}>{securityStatus.auditLogEntries} events</Text>
          </View>
          <View style={styles.protectionItem}>
            <Text style={styles.protectionLabel}>Rate Limiting</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={styles.protectionItem}>
            <Text style={styles.protectionLabel}>Input Validation</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPermissionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>👥 Access Permissions</Text>
        
        {accessSummary.permissions && Object.entries(accessSummary.permissions).map(([key, value]) => (
          <View key={key} style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
            </Text>
            <View style={[styles.statusIndicator, 
              { backgroundColor: getStatusColor(value) }]} />
            <Text style={[styles.permissionValue, { color: getStatusColor(value) }]}>
              {value ? 'Allowed' : 'Denied'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>📊 Data Access Summary</Text>
        
        {accessSummary.dataAccess && Object.entries(accessSummary.dataAccess).map(([key, value]) => (
          <View key={key} style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              {key.replace(/Count$/, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
            </Text>
            <Text style={styles.dataValue}>{value} records</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAuditTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>📋 Security Audit Log</Text>
        <Text style={styles.auditSubtitle}>Last 20 security events</Text>
        
        <ScrollView style={styles.auditContainer}>
          {auditLog.length > 0 ? (
            auditLog.map((event, index) => (
              <View key={index} style={styles.auditItem}>
                <View style={styles.auditHeader}>
                  <Text style={styles.auditType}>{event.eventType}</Text>
                  <Text style={styles.auditTime}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.auditDetails}>
                  Access Level: {event.accessLevel} | 
                  Session: {event.sessionToken?.substring(0, 8)}...
                </Text>
                {event.details && Object.keys(event.details).length > 0 && (
                  <Text style={styles.auditExtra}>
                    {JSON.stringify(event.details, null, 2)}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noAuditData}>
              No audit data available or insufficient permissions
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );

  const renderControlsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>⚙️ Security Controls</Text>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={loadSecurityData}
          disabled={refreshing}
        >
          <Text style={styles.controlButtonText}>
            {refreshing ? 'Refreshing...' : '🔄 Refresh Security Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.warningButton]}
          onPress={handleClearCache}
        >
          <Text style={[styles.controlButtonText, styles.warningButtonText]}>
            🗑️ Clear Data Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.dangerButton]}
          onPress={handleEmergencyLockdown}
        >
          <Text style={[styles.controlButtonText, styles.dangerButtonText]}>
            🚨 Emergency Lockdown
          </Text>
        </TouchableOpacity>

        <View style={styles.controlInfo}>
          <Text style={styles.controlInfoTitle}>Security Features Active:</Text>
          <Text style={styles.controlInfoItem}>• End-to-end data encryption</Text>
          <Text style={styles.controlInfoItem}>• Session-based access control</Text>
          <Text style={styles.controlInfoItem}>• Real-time audit logging</Text>
          <Text style={styles.controlInfoItem}>• Rate limiting protection</Text>
          <Text style={styles.controlInfoItem}>• Input validation & sanitization</Text>
          <Text style={styles.controlInfoItem}>• Data integrity verification</Text>
          <Text style={styles.controlInfoItem}>• Role-based permissions</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔒 Security Dashboard</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {[
            { key: 'status', label: 'Status', icon: '🔐' },
            { key: 'permissions', label: 'Permissions', icon: '👥' },
            { key: 'audit', label: 'Audit Log', icon: '📋' },
            { key: 'controls', label: 'Controls', icon: '⚙️' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {selectedTab === 'status' && renderStatusTab()}
          {selectedTab === 'permissions' && renderPermissionsTab()}
          {selectedTab === 'audit' && renderAuditTab()}
          {selectedTab === 'controls' && renderControlsTab()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 5,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    paddingBottom: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  accessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  accessText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  protectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  protectionItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  protectionLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  protectionValue: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  permissionValue: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  auditSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  auditContainer: {
    maxHeight: 300,
  },
  auditItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  auditType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  auditTime: {
    fontSize: 12,
    color: '#666',
  },
  auditDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  auditExtra: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'monospace',
  },
  noAuditData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  warningButtonText: {
    color: 'white',
  },
  dangerButtonText: {
    color: 'white',
  },
  controlInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  controlInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  controlInfoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default SecurityDashboard;