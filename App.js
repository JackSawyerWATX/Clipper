import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert as RNAlert, Platform, Dimensions } from 'react-native';

// Import Web-compatible Alert
import WebAlert from './utils/WebAlert';

// Use web-compatible Alert
const Alert = Platform.OS === 'web' ? WebAlert : RNAlert;

// Import Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import PlaceOrder from './components/PlaceOrder';
import Shipments from './components/Shipments';
import Analytics from './components/Analytics';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Reports from './components/Reports';
import Payments from './components/Payments';
import SecurityDashboard from './components/SecurityDashboard';
import Login from './components/Login';

// Import Security
import securityManager from './security/SecurityManager';
import secureDataAccess from './security/SecureDataAccess';

// Import Responsive Manager and Web Platform utilities
import { ResponsiveManager } from './utils/ResponsiveManager';
import WebPlatform from './utils/WebPlatform';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [securityDashboardVisible, setSecurityDashboardVisible] = useState(false);
  const [isSecureSession, setIsSecureSession] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Overview & KPIs' },
    { id: 'inventory', name: 'Inventory', icon: '📦', description: 'Parts & Stock' },
    { id: 'shipments', name: 'Shipments', icon: '🚚', description: 'Logistics & Tracking' },
    { id: 'orders', name: 'Orders', icon: '📋', description: 'Order Management' },
    { id: 'placeorder', name: 'Place Order', icon: '🛒', description: 'Create New Orders' },
    { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Business Intelligence' },
    { id: 'customers', name: 'Customers', icon: '👥', description: 'Client Management' },
    { id: 'suppliers', name: 'Suppliers', icon: '🏭', description: 'Vendor Network' },
    { id: 'payments', name: 'Payments', icon: '💳', description: 'Payment Processing' },
    { id: 'reports', name: 'Reports', icon: '📄', description: 'Financial Reports' }
  ];

  // Update screen dimensions on change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  // Initialize web-specific features on app start
  useEffect(() => {
    // Initialize web-specific features
    if (Platform.OS === 'web') {
      WebPlatform.setWebTitle('Clipper Aviation Logistics - Login');
      console.log('🌐 Clipper Aviation Logistics - Web Platform Initialized');
      console.log('📱 Device Type:', {
        isDesktop: WebPlatform.isDesktop(),
        isTablet: WebPlatform.isTablet(),
        isMobile: WebPlatform.isMobile(),
        supportsTouch: WebPlatform.supportsTouch(),
        supportsHover: WebPlatform.supportsHover()
      });
    }
  }, []);

  // Web-specific keyboard navigation
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleTabNavigation = (event) => {
      const { tabId } = event.detail;
      if (tabId && tabs.find(tab => tab.id === tabId)) {
        setActiveTab(tabId);
      }
    };

    const handleCloseModals = () => {
      setSecurityDashboardVisible(false);
    };

    window.addEventListener('navigate-to-tab', handleTabNavigation);
    window.addEventListener('close-modals', handleCloseModals);

    return () => {
      window.removeEventListener('navigate-to-tab', handleTabNavigation);
      window.removeEventListener('close-modals', handleCloseModals);
    };
  }, [tabs]);

  const handleLoginSuccess = (authData) => {
    try {
      // Extract user from authData - handle both direct user object and nested structure
      const user = authData.user || authData;
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsSecureSession(true);
      
      // Update web title after login
      if (Platform.OS === 'web') {
        const displayName = user.name || user.username || 'User';
        WebPlatform.setWebTitle(`Clipper Aviation Logistics - ${displayName}`);
      }
      
      // Try security manager but don't block on it
      try {
        const userIdentifier = user.username || user.email || 'unknown';
        if (securityManager && securityManager.logActivity) {
          securityManager.logActivity('SESSION_START', `User ${userIdentifier} authenticated successfully`);
        }
      } catch (secError) {
        console.warn('Security manager warning (non-blocking):', secError);
      }
      
    } catch (error) {
      console.error('❌ Authentication Error:', error);
      Alert.alert('Authentication Error', error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '🔓 Logout Confirmation',
      'Are you sure you want to logout? All unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            try {
              // Try security manager but don't block on it
              if (securityManager && securityManager.logActivity) {
                securityManager.logActivity('SESSION_END', `User ${currentUser?.username} logged out`);
              }
              if (securityManager && securityManager.endSession) {
                securityManager.endSession();
              }
              
              // Clear authentication state
              setIsAuthenticated(false);
              setCurrentUser(null);
              setIsSecureSession(false);
              setActiveTab('dashboard');
              
              if (Platform.OS === 'web') {
                WebPlatform.setWebTitle('Clipper Aviation Logistics - Login');
              }
            } catch (error) {
              console.error('Logout error:', error);
              // Even if there's an error, still clear the state
              setIsAuthenticated(false);
              setCurrentUser(null);
              setIsSecureSession(false);
              setActiveTab('dashboard');
            }
          }
        }
      ]
    );
  };

  const handleSecurityAccess = () => {
    const status = securityManager.getSecurityStatus();
    if (!status.isAuthenticated) {
      Alert.alert(
        'Access Denied',
        'No active security session. Please restart the application.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSecurityDashboardVisible(true);
  };

  // Get layout configuration - force web to show tablet navigation if not desktop
  const isDesktop = Platform.OS === 'web' ? screenData.width >= 1200 : screenData.width >= 1024;
  const isTablet = Platform.OS === 'web' ? screenData.width >= 600 && screenData.width < 1200 : screenData.width >= 768 && screenData.width < 1024;
  const isMobile = Platform.OS === 'web' ? screenData.width < 600 : screenData.width < 768;
  
  // Debug screen info on web
  if (Platform.OS === 'web' && console) {
    console.log('Screen Data:', { 
      width: screenData.width, 
      height: screenData.height, 
      isDesktop, 
      isTablet, 
      isMobile 
    });
  }

  // Render desktop sidebar navigation
  const renderSidebar = () => {
    if (!isDesktop) return null;

    return (
      <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
        <View style={styles.sidebarHeader}>
          <TouchableOpacity 
            style={styles.collapseButton}
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Text style={styles.collapseIcon}>
              {sidebarCollapsed ? '→' : '←'}
            </Text>
          </TouchableOpacity>
          {!sidebarCollapsed && (
            <>
              <Text style={styles.sidebarTitle}>✈️ Clipper</Text>
              <Text style={styles.sidebarSubtitle}>Aviation Logistics</Text>
            </>
          )}
        </View>
        
        <ScrollView style={styles.sidebarContent}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[
                styles.sidebarItem, 
                activeTab === tab.id && styles.sidebarItemActive
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.sidebarIcon}>{tab.icon}</Text>
              {!sidebarCollapsed && (
                <View style={styles.sidebarItemContent}>
                  <Text style={[
                    styles.sidebarItemText,
                    activeTab === tab.id && styles.sidebarItemTextActive
                  ]}>
                    {tab.name}
                  </Text>
                  <Text style={styles.sidebarItemDescription}>
                    {tab.description}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sidebarFooter}>
          {isSecureSession && !sidebarCollapsed && (
            <View style={styles.sidebarSecurityStatus}>
              <View style={styles.securityDot} />
              <Text style={styles.sidebarSecurityText}>System Secured</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.sidebarSecurityButton}
            onPress={handleSecurityAccess}
          >
            <Text style={styles.sidebarSecurityIcon}>🔒</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Component rendering based on active tab
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'shipments': return <Shipments />;
      case 'orders': return <Orders />;
      case 'placeorder': return <PlaceOrder />;
      case 'analytics': return <Analytics />;
      case 'customers': return <Customers />;
      case 'suppliers': return <Suppliers />;
      case 'payments': return <Payments />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Login onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Desktop Layout */}
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          {renderSidebar()}
          <View style={[styles.mainContent, sidebarCollapsed && styles.mainContentExpanded]}>
            <View style={styles.desktopHeader}>
              <View style={styles.desktopHeaderLeft}>
                <Text style={styles.desktopPageTitle}>
                  {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                </Text>
                <Text style={styles.desktopPageDescription}>
                  {tabs.find(tab => tab.id === activeTab)?.description || ''}
                </Text>
              </View>
              <View style={styles.desktopHeaderRight}>
                {currentUser && (
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{currentUser.name}</Text>
                    <Text style={styles.userRole}>({currentUser.role})</Text>
                  </View>
                )}
                {isSecureSession && (
                  <View style={styles.desktopSecurityIndicator}>
                    <View style={styles.securityDot} />
                    <Text style={styles.desktopSecurityText}>Secured</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.desktopSecurityButton}
                  onPress={handleSecurityAccess}
                >
                  <Text style={styles.desktopSecurityButtonText}>🔒 Security</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.desktopContent}>
              {renderActiveComponent()}
            </View>
          </View>
        </View>
      ) : (
        /* Mobile/Tablet Layout */
        <View style={styles.mobileLayout}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>✈️ Clipper</Text>
              {currentUser && (
                <Text style={styles.headerUser}>{currentUser.name}</Text>
              )}
            </View>
            <View style={styles.headerRight}>
              {isSecureSession && (
                <View style={styles.securityIndicator}>
                  <View style={styles.securityDot} />
                  <Text style={styles.securityText}>Secured</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.securityButton}
                onPress={handleSecurityAccess}
              >
                <Text style={styles.securityButtonText}>🔒</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.securityButton}
                onPress={handleLogout}
              >
                <Text style={styles.securityButtonText}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Top Navigation for Tablet/Web when not desktop */}
          {(isTablet || (Platform.OS === 'web' && !isDesktop)) && (
            <View style={styles.topNav}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topNavScrollContainer}
              >
                {tabs.map(tab => (
                  <TouchableOpacity 
                    key={tab.id}
                    style={[styles.topNavItem, activeTab === tab.id && styles.activeTopNavItem]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Text style={styles.topNavIcon}>{tab.icon}</Text>
                    <Text style={[styles.topNavText, activeTab === tab.id && styles.activeTopNavText]}>
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {renderActiveComponent()}

          <View style={styles.bottomNav}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.navScrollContainer}
            >
              {tabs.map(tab => (
                <TouchableOpacity 
                  key={tab.id}
                  style={[styles.navItem, activeTab === tab.id && styles.activeNavItem]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={styles.navIcon}>{tab.icon}</Text>
                  <Text style={[styles.navText, activeTab === tab.id && styles.activeNavText]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      <SecurityDashboard 
        visible={securityDashboardVisible}
        onClose={() => setSecurityDashboardVisible(false)}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerUser: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  securityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  securityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityButtonText: {
    fontSize: 20,
  },
  // Desktop Layout Styles
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2c3e50',
    flexDirection: 'column',
  },
  sidebarCollapsed: {
    width: 70,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
    alignItems: 'flex-start',
  },
  collapseButton: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495e',
    borderRadius: 6,
    marginBottom: 15,
  },
  collapseIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sidebarSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  sidebarContent: {
    flex: 1,
    padding: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  sidebarItemActive: {
    backgroundColor: '#3498db',
  },
  sidebarIcon: {
    fontSize: 20,
    marginRight: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  sidebarItemContent: {
    flex: 1,
  },
  sidebarItemText: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  sidebarItemDescription: {
    color: '#95a5a6',
    fontSize: 12,
    marginTop: 2,
  },
  sidebarFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#34495e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarSecurityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sidebarSecurityText: {
    color: '#2ecc71',
    fontSize: 12,
    marginLeft: 8,
  },
  sidebarSecurityButton: {
    backgroundColor: '#34495e',
    borderRadius: 6,
    padding: 8,
  },
  sidebarSecurityIcon: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  mainContentExpanded: {
    marginLeft: 0,
  },
  desktopHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  desktopHeaderLeft: {
    flex: 1,
  },
  desktopPageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  desktopPageDescription: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  desktopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'flex-end',
    marginRight: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  userRole: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  desktopSecurityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 15,
  },
  desktopSecurityText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  desktopSecurityButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopSecurityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  desktopContent: {
    flex: 1,
    padding: 20,
  },
  mobileLayout: {
    flex: 1,
  },
  topNav: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topNavScrollContainer: {
    paddingHorizontal: 15,
  },
  topNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeTopNavItem: {
    backgroundColor: '#2196F3',
  },
  topNavIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  topNavText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTopNavText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomNav: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 5,
  },
  navScrollContainer: {
    paddingHorizontal: 10,
  },
  navItem: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavItem: {
    backgroundColor: '#e3f2fd',
  },
  navText: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
