import { Dimensions, Platform } from 'react-native';

class ResponsiveManager {
  constructor() {
    this.screenData = Dimensions.get('window');
    this.isWeb = Platform.OS === 'web';
    this.updateScreenData();
    
    // Listen for dimension changes
    this.dimensionListener = Dimensions.addEventListener('change', (result) => {
      this.screenData = result.window;
      this.updateScreenData();
    });
  }

  updateScreenData() {
    const { width, height } = this.screenData;
    
    // Device type detection
    this.isTablet = width >= 768 && width < 1024;
    this.isDesktop = width >= 1024;
    this.isMobile = width < 768;
    
    // Screen size categories
    this.isSmall = width < 480;
    this.isMedium = width >= 480 && width < 768;
    this.isLarge = width >= 768 && width < 1200;
    this.isXLarge = width >= 1200;
    
    // Layout configurations
    this.columns = this.getColumnCount();
    this.gridSpacing = this.getGridSpacing();
    this.containerPadding = this.getContainerPadding();
  }

  getColumnCount() {
    if (this.isSmall) return 1;
    if (this.isMedium) return 2;
    if (this.isLarge) return 3;
    return 4; // XLarge
  }

  getGridSpacing() {
    if (this.isMobile) return 10;
    if (this.isTablet) return 15;
    return 20; // Desktop
  }

  getContainerPadding() {
    if (this.isSmall) return 15;
    if (this.isMedium) return 20;
    if (this.isLarge) return 25;
    return 30; // XLarge
  }

  // Responsive font sizes
  getFontSize(size) {
    const scale = this.isDesktop ? 1.1 : this.isTablet ? 1.05 : 1;
    return size * scale;
  }

  // Card dimensions
  getCardWidth(columns = null) {
    const cols = columns || this.columns;
    const padding = this.containerPadding * 2;
    const spacing = this.gridSpacing * (cols - 1);
    return (this.screenData.width - padding - spacing) / cols;
  }

  // Navigation layout
  getNavigationLayout() {
    if (this.isDesktop) {
      return {
        type: 'sidebar',
        width: 250,
        collapsible: true
      };
    } else if (this.isTablet) {
      return {
        type: 'tabs',
        scrollable: true
      };
    } else {
      return {
        type: 'bottom',
        scrollable: true
      };
    }
  }

  // Modal sizes
  getModalSize() {
    if (this.isDesktop) {
      return {
        width: Math.min(800, this.screenData.width * 0.8),
        height: Math.min(600, this.screenData.height * 0.8)
      };
    } else if (this.isTablet) {
      return {
        width: this.screenData.width * 0.9,
        height: this.screenData.height * 0.85
      };
    } else {
      return {
        width: '100%',
        height: '100%'
      };
    }
  }

  // Table/list layout
  getListLayout() {
    if (this.isDesktop) {
      return {
        type: 'table',
        showAllColumns: true,
        itemsPerPage: 25
      };
    } else if (this.isTablet) {
      return {
        type: 'grid',
        showMainColumns: true,
        itemsPerPage: 15
      };
    } else {
      return {
        type: 'cards',
        showEssentialInfo: true,
        itemsPerPage: 10
      };
    }
  }

  // Input field configurations
  getInputConfig() {
    return {
      height: this.isDesktop ? 45 : this.isTablet ? 42 : 40,
      fontSize: this.getFontSize(16),
      padding: this.isDesktop ? 12 : 10
    };
  }

  // Spacing helpers
  getSpacing(size) {
    const multiplier = this.isDesktop ? 1.2 : this.isTablet ? 1.1 : 1;
    return size * multiplier;
  }

  // Header configuration
  getHeaderConfig() {
    if (this.isDesktop) {
      return {
        height: 70,
        showAllButtons: true,
        showSearchBar: true,
        layout: 'horizontal'
      };
    } else if (this.isTablet) {
      return {
        height: 60,
        showMainButtons: true,
        showSearchBar: false,
        layout: 'horizontal'
      };
    } else {
      return {
        height: 50,
        showEssentialButtons: true,
        showSearchBar: false,
        layout: 'stacked'
      };
    }
  }

  // Dashboard layout
  getDashboardLayout() {
    if (this.isDesktop) {
      return {
        statsCards: { columns: 4, rows: 1 },
        charts: { columns: 2, rows: 2 },
        tables: { columns: 1, rows: 1, fullWidth: true }
      };
    } else if (this.isTablet) {
      return {
        statsCards: { columns: 3, rows: 1 },
        charts: { columns: 2, rows: 1 },
        tables: { columns: 1, rows: 1, fullWidth: true }
      };
    } else {
      return {
        statsCards: { columns: 2, rows: 2 },
        charts: { columns: 1, rows: 1 },
        tables: { columns: 1, rows: 1, fullWidth: true }
      };
    }
  }

  // Cleanup listener
  dispose() {
    if (this.dimensionListener) {
      this.dimensionListener.remove();
    }
  }

  // Utility methods
  isPortrait() {
    return this.screenData.height > this.screenData.width;
  }

  isLandscape() {
    return this.screenData.width > this.screenData.height;
  }

  getBreakpoint() {
    if (this.isSmall) return 'xs';
    if (this.isMedium) return 'sm';
    if (this.isLarge) return 'md';
    if (this.isXLarge) return 'lg';
    return 'xl';
  }
}

// Export both class and instance
export { ResponsiveManager };

// Export singleton instance as default
const responsiveManager = new ResponsiveManager();
export default responsiveManager;