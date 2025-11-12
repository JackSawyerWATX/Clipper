// Web-specific index.js for React Native Web
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the main App component
AppRegistry.registerComponent('main', () => App);

// Web-specific initialization
if (typeof document !== 'undefined') {
  // Web platform detected
  console.log('🌐 Clipper Aviation Logistics - Web Platform Initialized');
  
  // Configure web-specific settings
  document.title = 'Clipper Aviation Logistics';
  
  // Add web-specific meta tags if not present
  const addMetaTag = (name, content) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  };
  
  addMetaTag('viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no');
  addMetaTag('theme-color', '#2196F3');
  addMetaTag('description', 'Professional aviation logistics and parts management system');
  
  // Add favicon if not present
  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = '/favicon.ico';
    document.head.appendChild(favicon);
  }
  
  // Web-specific keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Handle Ctrl/Cmd + number keys for navigation
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '8') {
      event.preventDefault();
      const tabMap = {
        '1': 'dashboard',
        '2': 'inventory', 
        '3': 'orders',
        '4': 'shipments',
        '5': 'analytics',
        '6': 'customers',
        '7': 'suppliers',
        '8': 'reports'
      };
      
      // Dispatch custom event that the App component can listen to
      window.dispatchEvent(new CustomEvent('navigate-to-tab', {
        detail: { tabId: tabMap[event.key] }
      }));
    }
    
    // Ctrl/Cmd + F for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // ESC to close modals
    if (event.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('close-modals'));
    }
  });
  
  // Web performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('🚀 Web Performance:', {
          loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          timeToFirstByte: Math.round(perfData.responseStart - perfData.fetchStart)
        });
      }, 0);
    });
  }
  
  // Web-specific error handling
  window.addEventListener('error', (event) => {
    console.error('🚨 Web Error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
  });
  
  // Service worker registration for PWA functionality
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    });
  }
}