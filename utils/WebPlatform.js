import { Platform, Dimensions } from 'react-native';

// Web Platform Utilities
export class WebPlatform {
  static isWeb() {
    return Platform.OS === 'web';
  }

  static isDesktop() {
    if (!this.isWeb()) return false;
    const { width } = Dimensions.get('window');
    return width >= 1024;
  }

  static isTablet() {
    if (!this.isWeb()) return false;
    const { width } = Dimensions.get('window');
    return width >= 768 && width < 1024;
  }

  static isMobile() {
    if (!this.isWeb()) return false;
    const { width } = Dimensions.get('window');
    return width < 768;
  }

  static getViewport() {
    if (!this.isWeb()) return null;
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  static supportsTouch() {
    if (!this.isWeb()) return true;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static supportsHover() {
    if (!this.isWeb()) return false;
    return window.matchMedia('(hover: hover)').matches;
  }

  static getWebFeatures() {
    if (!this.isWeb()) return {};
    
    return {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      localStorage: typeof Storage !== 'undefined',
      indexedDB: 'indexedDB' in window,
      webGL: !!window.WebGLRenderingContext,
      webAssembly: typeof WebAssembly === 'object',
      fullscreen: !!(document.documentElement.requestFullscreen || 
                    document.documentElement.webkitRequestFullscreen),
      clipboard: !!navigator.clipboard,
      share: !!navigator.share,
      pwa: window.matchMedia('(display-mode: standalone)').matches
    };
  }

  static addWebEventListeners() {
    if (!this.isWeb()) return;

    // Prevent default behaviors that interfere with the app
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    
    // Handle back button navigation
    window.addEventListener('popstate', (e) => {
      // Emit custom event for React components to handle
      window.dispatchEvent(new CustomEvent('web-navigation-back', {
        detail: e.state
      }));
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      window.dispatchEvent(new CustomEvent('web-connectivity-change', {
        detail: { online: true }
      }));
    });

    window.addEventListener('offline', () => {
      window.dispatchEvent(new CustomEvent('web-connectivity-change', {
        detail: { online: false }
      }));
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      window.dispatchEvent(new CustomEvent('web-visibility-change', {
        detail: { hidden: document.hidden }
      }));
    });

    // Handle print events
    window.addEventListener('beforeprint', () => {
      document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
    });
  }

  static optimizeForWeb() {
    if (!this.isWeb()) return;

    // Optimize scroll behavior
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Add web app meta tags
    this.addWebAppMeta();
    
    // Initialize web event listeners
    this.addWebEventListeners();

    // Add performance monitoring
    this.addPerformanceMonitoring();
  }

  static addWebAppMeta() {
    if (!this.isWeb()) return;

    const meta = [
      { name: 'application-name', content: 'Clipper Aviation Logistics' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-tap-highlight', content: 'no' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover' }
    ];

    meta.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const metaTag = document.createElement('meta');
        metaTag.name = name;
        metaTag.content = content;
        document.head.appendChild(metaTag);
      }
    });
  }

  static addPerformanceMonitoring() {
    if (!this.isWeb() || !('performance' in window)) return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`🚀 ${entry.name}: ${Math.round(entry.value)}ms`);
      });
    });

    // Observe different metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all metrics
      console.log('Performance monitoring: Some metrics not supported');
    }

    // Monitor resource loading
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('📊 Web Performance Metrics:', {
          'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          'Load Complete': Math.round(perfData.loadEventEnd - perfData.fetchStart),
          'First Byte': Math.round(perfData.responseStart - perfData.fetchStart),
          'DOM Interactive': Math.round(perfData.domInteractive - perfData.fetchStart)
        });
      }
    });
  }

  static handleWebKeyboard(callback) {
    if (!this.isWeb()) return () => {};

    const handler = (event) => {
      callback(event);
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }

  static setWebTitle(title) {
    if (!this.isWeb()) return;
    document.title = title;
  }

  static setWebFavicon(url) {
    if (!this.isWeb()) return;
    
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  static showWebNotification(title, options = {}) {
    if (!this.isWeb() || !('Notification' in window)) return null;

    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          return new Notification(title, options);
        }
        return null;
      });
    }
    return null;
  }

  static copyToClipboard(text) {
    if (!this.isWeb()) return Promise.reject('Not web platform');
    
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve();
  }

  static shareContent(data) {
    if (!this.isWeb()) return Promise.reject('Not web platform');
    
    if (navigator.share) {
      return navigator.share(data);
    }
    
    // Fallback to clipboard
    const shareText = `${data.title}\n${data.text}\n${data.url}`;
    return this.copyToClipboard(shareText);
  }
}

// Initialize web optimizations when this module loads
if (WebPlatform.isWeb()) {
  // Set up on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WebPlatform.optimizeForWeb();
    });
  } else {
    WebPlatform.optimizeForWeb();
  }
}

export default WebPlatform;