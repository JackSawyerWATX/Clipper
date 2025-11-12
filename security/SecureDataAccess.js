import securityManager from '../security/SecurityManager';
import { customersData as rawCustomersData } from '../data/customersData';
import { aircraftInventory as rawInventoryData } from '../data/aircraftInventory';
import { invoicesData as rawInvoicesData, recurringPurchasesData as rawRecurringData } from '../data/invoicesData';
import { shippingData as rawShippingData } from '../data/shippingData';
import { suppliersData as rawSuppliersData } from '../data/suppliersData';

class SecureDataAccess {
  constructor() {
    this.dataCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if user has permission to access data
  checkAccess(requiredLevel = 'user') {
    const session = securityManager.validateSession();
    if (!session.valid) {
      securityManager.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        requiredLevel,
        reason: session.reason
      });
      throw new Error(`Access denied: ${session.reason}`);
    }

    if (!securityManager.hasPermission(requiredLevel)) {
      securityManager.logSecurityEvent('INSUFFICIENT_PERMISSIONS', {
        requiredLevel,
        currentLevel: session.accessLevel
      });
      throw new Error(`Insufficient permissions. Required: ${requiredLevel}`);
    }

    return session;
  }

  // Rate limit check
  checkRateLimit(operation) {
    if (!securityManager.checkRateLimit(operation)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  // Get cached data or fetch new
  getCachedData(key, fetchFunction) {
    const cached = this.dataCache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const data = fetchFunction();
    this.dataCache.set(key, {
      data: data,
      timestamp: now
    });

    return data;
  }

  // Secure Customers Data Access
  getCustomers(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_CUSTOMERS');

    const cacheKey = `customers_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      const sanitizedData = rawCustomersData.map(customer => 
        securityManager.sanitizeData(customer, 'customer')
      ).filter(Boolean);

      securityManager.logSecurityEvent('CUSTOMER_DATA_ACCESS', {
        recordCount: sanitizedData.length
      });

      return sanitizedData;
    });
  }

  // Get single customer with enhanced security
  getCustomer(customerId, requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_CUSTOMER');

    const customer = rawCustomersData.find(c => c.id === customerId);
    if (!customer) {
      securityManager.logSecurityEvent('CUSTOMER_NOT_FOUND', { customerId });
      throw new Error('Customer not found');
    }

    const sanitized = securityManager.sanitizeData(customer, 'customer');
    
    securityManager.logSecurityEvent('SINGLE_CUSTOMER_ACCESS', {
      customerId,
      accessLevel: securityManager.accessLevel
    });

    return sanitized;
  }

  // Secure Inventory Data Access
  getInventory(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_INVENTORY');

    const cacheKey = `inventory_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      const sanitizedData = rawInventoryData.map(item => 
        securityManager.sanitizeData(item, 'inventory')
      ).filter(Boolean);

      securityManager.logSecurityEvent('INVENTORY_DATA_ACCESS', {
        recordCount: sanitizedData.length
      });

      return sanitizedData;
    });
  }

  // Secure Invoice Data Access
  getInvoices(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_INVOICES');

    const cacheKey = `invoices_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      const sanitizedData = rawInvoicesData.map(invoice => 
        securityManager.sanitizeData(invoice, 'invoice')
      ).filter(Boolean);

      securityManager.logSecurityEvent('INVOICE_DATA_ACCESS', {
        recordCount: sanitizedData.length
      });

      return sanitizedData;
    });
  }

  // Get single invoice with enhanced security
  getInvoice(invoiceId, requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_INVOICE');

    const invoice = rawInvoicesData.find(inv => inv.id === invoiceId);
    if (!invoice) {
      securityManager.logSecurityEvent('INVOICE_NOT_FOUND', { invoiceId });
      throw new Error('Invoice not found');
    }

    const sanitized = securityManager.sanitizeData(invoice, 'invoice');
    
    securityManager.logSecurityEvent('SINGLE_INVOICE_ACCESS', {
      invoiceId,
      accessLevel: securityManager.accessLevel
    });

    return sanitized;
  }

  // Secure Recurring Purchases Access
  getRecurringPurchases(requiredLevel = 'admin') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_RECURRING');

    const cacheKey = `recurring_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      securityManager.logSecurityEvent('RECURRING_DATA_ACCESS', {
        recordCount: rawRecurringData.length
      });

      return rawRecurringData;
    });
  }

  // Secure Shipping Data Access
  getShippingData(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_SHIPPING');

    const cacheKey = `shipping_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      securityManager.logSecurityEvent('SHIPPING_DATA_ACCESS', {
        recordCount: rawShippingData.length
      });

      return rawShippingData;
    });
  }

  // Secure Suppliers Data Access
  getSuppliers(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_SUPPLIERS');

    const cacheKey = `suppliers_${securityManager.accessLevel}`;
    
    return this.getCachedData(cacheKey, () => {
      const sanitizedData = rawSuppliersData.map(supplier => 
        securityManager.sanitizeData(supplier, 'supplier')
      ).filter(Boolean);

      securityManager.logSecurityEvent('SUPPLIERS_DATA_ACCESS', {
        recordCount: sanitizedData.length
      });

      return sanitizedData;
    });
  }

  // Secure Analytics Data (aggregated, no personal info)
  getAnalyticsData(requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('GET_ANALYTICS');

    // Generate anonymous analytics
    const analytics = {
      totalCustomers: rawCustomersData.length,
      totalInventoryItems: rawInventoryData.length,
      totalInvoices: rawInvoicesData.length,
      totalSuppliers: rawSuppliersData.length,
      inventoryValue: securityManager.hasPermission('admin') ? 
        rawInventoryData.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 
        '[RESTRICTED]',
      revenue: securityManager.hasPermission('admin') ?
        rawInvoicesData
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + inv.total, 0) :
        '[RESTRICTED]'
    };

    securityManager.logSecurityEvent('ANALYTICS_ACCESS');
    return analytics;
  }

  // Search with security filtering
  secureSearch(query, dataType, requiredLevel = 'user') {
    this.checkAccess(requiredLevel);
    this.checkRateLimit('SEARCH');

    // Sanitize search input
    const sanitizedQuery = securityManager.sanitizeInput(query.toLowerCase());
    
    let results = [];
    
    switch (dataType) {
      case 'customers':
        const customers = this.getCustomers(requiredLevel);
        results = customers.filter(customer => 
          customer.name?.toLowerCase().includes(sanitizedQuery) ||
          customer.company?.toLowerCase().includes(sanitizedQuery)
        );
        break;
        
      case 'inventory':
        const inventory = this.getInventory(requiredLevel);
        results = inventory.filter(item => 
          item.name?.toLowerCase().includes(sanitizedQuery) ||
          item.partNumber?.toLowerCase().includes(sanitizedQuery)
        );
        break;
        
      case 'invoices':
        const invoices = this.getInvoices(requiredLevel);
        results = invoices.filter(invoice => 
          invoice.id?.toLowerCase().includes(sanitizedQuery) ||
          invoice.customerName?.toLowerCase().includes(sanitizedQuery)
        );
        break;
        
      default:
        throw new Error('Invalid search data type');
    }

    securityManager.logSecurityEvent('SECURE_SEARCH', {
      query: sanitizedQuery,
      dataType,
      resultCount: results.length
    });

    return results;
  }

  // Get user's data access summary
  getAccessSummary() {
    const session = securityManager.validateSession();
    if (!session.valid) {
      return { error: 'No active session' };
    }

    return {
      accessLevel: session.accessLevel,
      permissions: {
        customers: securityManager.hasPermission('user'),
        fullCustomerData: securityManager.hasPermission('admin'),
        invoices: securityManager.hasPermission('user'),
        fullInvoiceData: securityManager.hasPermission('admin'),
        inventory: securityManager.hasPermission('user'),
        fullInventoryData: securityManager.hasPermission('admin'),
        suppliers: securityManager.hasPermission('user'),
        fullSupplierData: securityManager.hasPermission('admin'),
        recurringPurchases: securityManager.hasPermission('admin'),
        auditLog: securityManager.hasPermission('admin')
      },
      dataAccess: {
        customersCount: securityManager.hasPermission('user') ? rawCustomersData.length : 0,
        inventoryCount: securityManager.hasPermission('user') ? rawInventoryData.length : 0,
        invoicesCount: securityManager.hasPermission('user') ? rawInvoicesData.length : 0,
        suppliersCount: securityManager.hasPermission('user') ? rawSuppliersData.length : 0
      }
    };
  }

  // Clear all cached data (security measure)
  clearCache() {
    this.dataCache.clear();
    securityManager.logSecurityEvent('CACHE_CLEARED');
  }

  // Emergency data lockdown
  emergencyLockdown() {
    this.clearCache();
    securityManager.endSession();
    securityManager.logSecurityEvent('EMERGENCY_LOCKDOWN');
    throw new Error('System in lockdown mode. Please contact administrator.');
  }
}

// Export singleton instance
const secureDataAccess = new SecureDataAccess();
export default secureDataAccess;