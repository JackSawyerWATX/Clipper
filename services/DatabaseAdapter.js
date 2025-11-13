/**
 * Database Adapter - Gradual transition from static files to MongoDB
 * 
 * This adapter provides a unified interface that can switch between
 * static file data and MongoDB based on configuration.
 */

import { databaseService } from './DatabaseService.js';
import { customersData as staticCustomers } from '../data/customersData.js';
import { aircraftPartsInventory as staticInventory } from '../data/aircraftInventory.js';
import { suppliersData as staticSuppliers } from '../data/suppliersData.js';
import { invoicesData as staticInvoices } from '../data/invoicesData.js';
import { ordersData as staticOrders } from '../data/shippingData.js';

class DatabaseAdapter {
  // Order Operations
  async getOrders(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getOrders({}, options);
    }
    let data = [...staticOrders];
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }
    if (options.limit) data = data.slice(0, options.limit);
    return data;
  }
  constructor() {
    // Use MongoDB only on server (Node) environments. For web (browser) builds,
    // prefer fetching from the backend API or falling back to static data.
    this.useMongoDB = (typeof window === 'undefined');
    this.mongoConnected = false;
    this.initPromise = null;
    this.sessionOrders = [];
  }

  async initialize() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  async _initialize() {
    if (!this.useMongoDB) return true;
    try {
      await databaseService.initialize();
      this.mongoConnected = true;
      return true;
    } catch (error) {
      this.useMongoDB = false;
      this.mongoConnected = false;
      return false;
    }
  }

  async shouldUseMongoDB() {
    await this.initialize();
    return this.useMongoDB && this.mongoConnected;
  }

  // Customer Operations
  async getCustomers(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getCustomers({}, options);
    }
    let data = [...staticCustomers];
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }
    if (options.limit) data = data.slice(0, options.limit);
    return data;
  }
  async getCustomerById(id) {
    if (await this.shouldUseMongoDB()) return await databaseService.getCustomerById(id);
    return staticCustomers.find(c => c.id === id || c._id === id);
  }
  async createCustomer(customerData) {
    if (await this.shouldUseMongoDB()) return await databaseService.createCustomer(customerData);
    return { ...customerData, id: `CUST${Date.now()}`, _id: `CUST${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
  }
  async updateCustomer(id, updateData) {
    if (await this.shouldUseMongoDB()) return await databaseService.updateCustomer(id, updateData);
    const customer = staticCustomers.find(c => c.id === id || c._id === id);
    if (customer) return { ...customer, ...updateData, updatedAt: new Date() };
    return null;
  }

  // Inventory Operations
  async getInventory(options = {}) {
    if (await this.shouldUseMongoDB()) return await databaseService.getInventory({}, options);
    let data = [...staticInventory];
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }
    if (options.limit) data = data.slice(0, options.limit);
    return data;
  }
  async getInventoryById(id) {
    if (await this.shouldUseMongoDB()) return await databaseService.getInventoryById(id);
    return staticInventory.find(i => i.id === id || i._id === id);
  }
  async createInventoryItem(itemData) {
    if (await this.shouldUseMongoDB()) return await databaseService.createInventoryItem(itemData);
    return { ...itemData, id: `AC${Date.now()}`, _id: `AC${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
  }
  async adjustStock(partId, quantityChange, reason = 'Manual Adjustment') {
    if (await this.shouldUseMongoDB()) return await databaseService.adjustStock(partId, quantityChange, reason);
    const item = staticInventory.find(i => i.id === partId || i._id === partId || i.partId === partId);
    if (item) {
      item.inStock = Math.max(0, (item.inStock || 0) + quantityChange);
      return item;
    } else {
      throw new Error(`Inventory item not found: ${partId}`);
    }
  }
  async getLowStock() {
    if (await this.shouldUseMongoDB()) return await databaseService.getLowStock();
    return staticInventory.filter(item => item.inStock <= (item.minimumStock || 10));
  }
  async searchInventory(searchTerm) {
    if (await this.shouldUseMongoDB()) return await databaseService.searchInventory(searchTerm);
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
    if (await this.shouldUseMongoDB()) return await databaseService.getSuppliers({}, options);
    const isWeb = typeof window !== 'undefined';
    if (isWeb) {
      try {
        const url = 'http://localhost:4000/suppliers';
        const response = await fetch(url);
        if (!response.ok) throw new Error('API error');
        let data = await response.json();
        if (options.sort) {
          const sortKey = Object.keys(options.sort)[0];
          const sortOrder = options.sort[sortKey];
          data = [...data].sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
        }
        if (options.limit) data = data.slice(0, options.limit);
        return data;
      } catch (err) {
        console.warn('⚠️ Could not fetch suppliers from backend API, falling back to static data:', err.message);
      }
    }
    let data = [...staticSuppliers];
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }
    if (options.limit) data = data.slice(0, options.limit);
    return data;
  }

  // Order Operations
  async getOrders(options = {}) {
    if (await this.shouldUseMongoDB()) {
      return await databaseService.getOrders({}, options);
    }
    let data = [...staticOrders];
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      data.sort((a, b) => (sortOrder === 1 ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)));
    }
    if (options.limit) data = data.slice(0, options.limit);
    return data;
  }
  async getSupplierById(id) {
    if (await this.shouldUseMongoDB()) return await databaseService.getSupplierById(id);
    return staticSuppliers.find(s => s.id === id || s._id === id);
  }
  async createSupplier(supplierData) {
    if (await this.shouldUseMongoDB()) return await databaseService.createSupplier(supplierData);
    return { ...supplierData, id: `SUP${Date.now()}`, _id: `SUP${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
  }

  // Add similar methods for orders, invoices, etc. as needed...
}

export const databaseAdapter = new DatabaseAdapter();
export default databaseAdapter;