/**
 * Database Adapter - Gradual transition from static files to MongoDB
 * 
 * This adapter provides a unified interface that can switch between
 * static file data and MongoDB based on configuration.
 */

import { databaseService } from './DatabaseService.js';

// Import static data as fallback
import { customersData as staticCustomers } from '../data/customersData.js';
import { aircraftPartsInventory as staticInventory } from '../data/aircraftInventory.js';
import { suppliersData as staticSuppliers } from '../data/suppliersData.js';
import { invoicesData as staticInvoices } from '../data/invoicesData.js';
import { ordersData as staticOrders } from '../data/shippingData.js';

class DatabaseAdapter {
  constructor() {
    // Configuration - can be changed via environment variable
    this.useMongoDB = process.env.USE_MONGODB === 'true' || false;
    this.mongoConnected = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  async _initialize() {
    if (!this.useMongoDB) {
      console.log('📁 DatabaseAdapter: Using static file data');
      return true;
    }

    try {
      await databaseService.initialize();
      this.mongoConnected = true;
      console.log('🗄️ DatabaseAdapter: Connected to MongoDB');
      return true;
    } catch (error) {
      console.warn('⚠️ DatabaseAdapter: MongoDB connection failed, falling back to static data', error.message);
      this.useMongoDB = false;
      this.mongoConnected = false;
      return false;
    }
  }

  // Utility method to check if we should use MongoDB
  async shouldUseMongoDB() {
    await this.initialize();
    return this.useMongoDB && this.mongoConnected;
  }

  // Customer Operations
  async getCustomers(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getCustomers({}, options);
    }
    
    // Static data fallback
    let data = [...staticCustomers];
    
    // Apply basic filtering and sorting for static data
    if (options.sort) {
      // Simple sorting implementation
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }
    
    if (options.limit) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }

  async getCustomerById(id) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getCustomerById(id);
    }
    
    return staticCustomers.find(c => c.id === id || c._id === id);
  }

  async createCustomer(customerData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.createCustomer(customerData);
    }
    
    // For static data, just return the data with a generated ID
    // Note: This won't persist in static mode
    console.warn('⚠️ Creating customer in static mode - changes will not persist');
    return {
      ...customerData,
      id: `CUST${Date.now()}`,
      _id: `CUST${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateCustomer(id, updateData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.updateCustomer(id, updateData);
    }
    
    console.warn('⚠️ Updating customer in static mode - changes will not persist');
    const customer = staticCustomers.find(c => c.id === id || c._id === id);
    if (customer) {
      return { ...customer, ...updateData, updatedAt: new Date() };
    }
    return null;
  }

  // Inventory Operations
  async getInventory(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getInventory({}, options);
    }
    
    let data = [...staticInventory];
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }
    
    if (options.limit) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }

  async getInventoryById(id) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getInventoryById(id);
    }
    
    return staticInventory.find(i => i.id === id || i._id === id);
  }

  async createInventoryItem(itemData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.createInventoryItem(itemData);
    }
    
    console.warn('⚠️ Creating inventory item in static mode - changes will not persist');
    return {
      ...itemData,
      id: `AC${Date.now()}`,
      _id: `AC${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getLowStock() {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getLowStock();
    }
    
    // Simulate low stock check for static data
    return staticInventory.filter(item => 
      item.inStock <= (item.minimumStock || 10)
    );
  }

  async searchInventory(searchTerm) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.searchInventory(searchTerm);
    }
    
    // Simple search for static data
    const term = searchTerm.toLowerCase();
    return staticInventory.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.manufacturer.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.partNumber && item.partNumber.toLowerCase().includes(term))
    );
  }

  // Supplier Operations
  async getSuppliers(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getSuppliers({}, options);
    }
    
    let data = [...staticSuppliers];
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }
    
    if (options.limit) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }

  async getSupplierById(id) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getSupplierById(id);
    }
    
    return staticSuppliers.find(s => s.id === id || s._id === id);
  }

  async createSupplier(supplierData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.createSupplier(supplierData);
    }
    
    console.warn('⚠️ Creating supplier in static mode - changes will not persist');
    return {
      ...supplierData,
      id: `SUP${Date.now()}`,
      _id: `SUP${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Order Operations
  async getOrders(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getOrders({}, options);
    }
    
    return staticOrders || [];
  }

  async getOrderById(id) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getOrderById(id);
    }
    
    return (staticOrders || []).find(o => o.id === id || o._id === id);
  }

  async createOrder(orderData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.createOrder(orderData);
    }
    
    console.warn('⚠️ Creating order in static mode - changes will not persist');
    return {
      ...orderData,
      id: `ORD${Date.now()}`,
      _id: `ORD${Date.now()}`,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Invoice Operations
  async getInvoices(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getInvoices({}, options);
    }
    
    let data = [...staticInvoices];
    
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }
    
    if (options.limit) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }

  async getInvoiceById(id) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getInvoiceById(id);
    }
    
    return staticInvoices.find(i => i.id === id || i._id === id);
  }

  async createInvoice(invoiceData) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.createInvoice(invoiceData);
    }
    
    console.warn('⚠️ Creating invoice in static mode - changes will not persist');
    return {
      ...invoiceData,
      id: `INV${Date.now()}`,
      _id: `INV${Date.now()}`,
      invoiceDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Dashboard and Analytics
  async getDashboardStats() {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getDashboardStats();
    }
    
    // Generate stats from static data
    const lowStock = this.getLowStock();
    const activeCustomers = staticCustomers.filter(c => c.status === 'Active');
    const pendingInvoices = staticInvoices.filter(i => i.status === 'Pending');
    const overdueInvoices = staticInvoices.filter(i => 
      i.status === 'Pending' && new Date(i.dueDate) < new Date()
    );
    
    const totalInventoryValue = staticInventory.reduce((sum, item) => 
      sum + (item.price * item.inStock), 0
    );
    
    return {
      customers: {
        total: staticCustomers.length,
        active: activeCustomers.length
      },
      inventory: {
        totalValue: totalInventoryValue,
        lowStockCount: (await lowStock).length
      },
      orders: {
        recentCount: (staticOrders || []).length,
        recentValue: (staticOrders || []).reduce((sum, order) => sum + (order.total || 0), 0)
      },
      invoices: {
        pending: pendingInvoices.length,
        overdue: overdueInvoices.length,
        overdueValue: overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
      }
    };
  }

  // Health and Status
  async healthCheck() {
    const staticHealth = {
      status: 'healthy',
      mode: 'static',
      collections: {
        customers: staticCustomers.length,
        inventory: staticInventory.length,
        suppliers: staticSuppliers.length,
        orders: (staticOrders || []).length,
        invoices: staticInvoices.length
      },
      timestamp: new Date().toISOString()
    };

    if (await this.shouldUseMongoDB()) {
      try {
        const mongoHealth = await databaseService.healthCheck();
        return {
          ...mongoHealth,
          mode: 'mongodb'
        };
      } catch (error) {
        return {
          ...staticHealth,
          mongoError: error.message
        };
      }
    }

    return staticHealth;
  }

  // Configuration methods
  enableMongoDB() {
    this.useMongoDB = true;
    this.mongoConnected = false; // Force reconnection
    this.initPromise = null; // Reset initialization
    console.log('🔄 DatabaseAdapter: Switching to MongoDB mode');
  }

  disableMongoDB() {
    this.useMongoDB = false;
    this.mongoConnected = false;
    console.log('📁 DatabaseAdapter: Switching to static file mode');
  }

  getMode() {
    return this.useMongoDB ? 'mongodb' : 'static';
  }
}

// Export singleton instance
export const databaseAdapter = new DatabaseAdapter();
export default databaseAdapter;