// Desktop specific configurations and enhancements
import { Platform } from 'react-native';

export const desktopConfig = {
  // Window management
  defaultWindowSize: {
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800
  },

  // Layout configurations
  layout: {
    sidebarWidth: 250,
    sidebarCollapsedWidth: 70,
    headerHeight: 70,
    contentPadding: 20,
    gridSpacing: 20
  },

  // Typography scale for desktop
  typography: {
    scales: {
      desktop: 1.1,
      tablet: 1.05,
      mobile: 1.0
    },
    baseSizes: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      body: 16,
      caption: 14,
      small: 12
    }
  },

  // Performance optimizations for desktop
  performance: {
    enableVirtualization: true,
    itemsPerPage: {
      desktop: 50,
      tablet: 30,
      mobile: 20
    },
    cacheSize: 1000,
    preloadDistance: 10
  },

  // Desktop-specific features
  features: {
    enableKeyboardShortcuts: true,
    enableContextMenus: true,
    enableDragAndDrop: true,
    enableMultiWindowSupport: false, // Future feature
    enableSystemNotifications: true
  },

  // Keyboard shortcuts
  shortcuts: {
    'Ctrl+1': 'dashboard',
    'Ctrl+2': 'inventory',
    'Ctrl+3': 'shipments',
    'Ctrl+4': 'orders',
    'Ctrl+5': 'analytics',
    'Ctrl+6': 'customers',
    'Ctrl+7': 'suppliers',
    'Ctrl+8': 'reports',
    'Ctrl+S': 'security',
    'Ctrl+F': 'search',
    'Esc': 'closeModal'
  },

  // Theme configurations
  themes: {
    light: {
      primary: '#2196F3',
      secondary: '#FF9800',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      sidebar: '#2c3e50',
      sidebarText: '#ecf0f1'
    },
    dark: {
      primary: '#1976D2',
      secondary: '#F57C00',
      success: '#388E3C',
      warning: '#F57C00',
      error: '#D32F2F',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      sidebar: '#1a1a1a',
      sidebarText: '#ffffff'
    }
  }
};

// Desktop utility functions
export const DesktopUtils = {
  // Check if running on desktop web
  isDesktopWeb() {
    return Platform.OS === 'web' && window.innerWidth >= 1024;
  },

  // Get optimal column count based on screen width
  getOptimalColumns(screenWidth, minColumnWidth = 300) {
    return Math.floor(screenWidth / minColumnWidth);
  },

  // Calculate responsive font size
  getResponsiveFontSize(baseSize, screenWidth) {
    if (screenWidth >= 1200) return baseSize * desktopConfig.typography.scales.desktop;
    if (screenWidth >= 768) return baseSize * desktopConfig.typography.scales.tablet;
    return baseSize * desktopConfig.typography.scales.mobile;
  },

  // Generate desktop-optimized card width
  getCardWidth(containerWidth, columns, spacing) {
    const totalSpacing = spacing * (columns - 1);
    return (containerWidth - totalSpacing) / columns;
  },

  // Handle keyboard shortcuts
  handleKeyboardShortcut(event, callback) {
    const { ctrlKey, key } = event;
    const shortcut = ctrlKey ? `Ctrl+${key.toUpperCase()}` : key;
    const action = desktopConfig.shortcuts[shortcut];
    
    if (action && callback) {
      event.preventDefault();
      callback(action);
    }
  },

  // Desktop-specific modal sizing
  getModalSize(screenWidth, screenHeight, type = 'default') {
    const configurations = {
      default: { width: 0.6, height: 0.7 },
      large: { width: 0.8, height: 0.8 },
      small: { width: 0.4, height: 0.5 },
      fullscreen: { width: 0.95, height: 0.95 }
    };

    const config = configurations[type] || configurations.default;
    
    return {
      width: Math.min(screenWidth * config.width, 1200),
      height: Math.min(screenHeight * config.height, 800)
    };
  },

  // Format data for desktop tables
  formatTableData(data, columns) {
    return data.map(item => {
      const formattedItem = {};
      columns.forEach(column => {
        formattedItem[column.key] = this.formatCellValue(item[column.key], column.type);
      });
      return formattedItem;
    });
  },

  // Format individual cell values
  formatCellValue(value, type) {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return value;
    }
  },

  // Generate desktop context menu items
  getContextMenuItems(type, item) {
    const baseItems = [
      { label: 'View Details', action: 'view' },
      { label: 'Edit', action: 'edit' },
      { type: 'separator' },
      { label: 'Delete', action: 'delete', style: 'destructive' }
    ];

    const typeSpecificItems = {
      customer: [
        { label: 'Send Email', action: 'email' },
        { label: 'View Orders', action: 'viewOrders' },
        ...baseItems
      ],
      invoice: [
        { label: 'Download PDF', action: 'downloadPdf' },
        { label: 'Send Reminder', action: 'sendReminder' },
        ...baseItems
      ],
      inventory: [
        { label: 'Reorder', action: 'reorder' },
        { label: 'Check Stock', action: 'checkStock' },
        ...baseItems
      ]
    };

    return typeSpecificItems[type] || baseItems;
  }
};

// Desktop theme provider
export const DesktopThemeProvider = {
  getCurrentTheme() {
    // Check system preference or user setting
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? desktopConfig.themes.dark : desktopConfig.themes.light;
  },

  applyTheme(theme) {
    // Apply CSS custom properties for web
    if (Platform.OS === 'web') {
      const root = document.documentElement;
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
    return theme;
  }
};

export default desktopConfig;