import { mongoConnection } from '../config/mongodb.js';
import { Customer, Inventory, Supplier, Order, Invoice, Shipment } from '../models/index.js';

class DatabaseService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      await mongoConnection.connect();
      this.isInitialized = true;
      console.log('✅ Database Service: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Database Service: Initialization failed:', error);
      throw error;
    }
  }

  // Customer Operations
  async getCustomers(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { createdAt: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Customer.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getCustomerById(id) {
    await this.initialize();
    return await Customer.findOne({
      $or: [
        { _id: id },
        { customerId: id }
      ]
    });
  }

  async createCustomer(customerData) {
    await this.initialize();
    const customer = new Customer(customerData);
    return await customer.save();
  }

  async updateCustomer(id, updateData) {
    await this.initialize();
    return await Customer.findOneAndUpdate(
      { $or: [{ _id: id }, { customerId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteCustomer(id) {
    await this.initialize();
    return await Customer.findOneAndDelete({
      $or: [{ _id: id }, { customerId: id }]
    });
  }

  // Inventory Operations
  async getInventory(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { name: 1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Inventory.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('supplier')
      .exec();
  }

  async getInventoryById(id) {
    await this.initialize();
    return await Inventory.findOne({
      $or: [
        { _id: id },
        { partId: id }
      ]
    }).populate('supplier');
  }

  async createInventoryItem(itemData) {
    await this.initialize();
    const item = new Inventory(itemData);
    return await item.save();
  }

  async updateInventoryItem(id, updateData) {
    await this.initialize();
    return await Inventory.findOneAndUpdate(
      { $or: [{ _id: id }, { partId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async adjustStock(partId, quantity, reason = 'Manual Adjustment') {
    await this.initialize();
    const item = await Inventory.findOne({
      $or: [{ _id: partId }, { partId: partId }]
    });
    
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    return await item.adjustStock(quantity, reason);
  }

  async getLowStock() {
    await this.initialize();
    return await Inventory.findLowStock();
  }

  async searchInventory(searchTerm) {
    await this.initialize();
    return await Inventory.searchParts(searchTerm);
  }

  // Supplier Operations
  async getSuppliers(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { companyName: 1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Supplier.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getSupplierById(id) {
    await this.initialize();
    return await Supplier.findOne({
      $or: [
        { _id: id },
        { supplierId: id }
      ]
    });
  }

  async createSupplier(supplierData) {
    await this.initialize();
    const supplier = new Supplier(supplierData);
    return await supplier.save();
  }

  async updateSupplier(id, updateData) {
    await this.initialize();
    return await Supplier.findOneAndUpdate(
      { $or: [{ _id: id }, { supplierId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Order Operations
  async getOrders(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { orderDate: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Order.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('customer')
      .exec();
  }

  async getOrderById(id) {
    await this.initialize();
    return await Order.findOne({
      $or: [
        { _id: id },
        { orderId: id }
      ]
    }).populate('customer');
  }

  async createOrder(orderData) {
    await this.initialize();
    const order = new Order(orderData);
    return await order.save();
  }

  async updateOrderStatus(orderId, status, notes = '') {
    await this.initialize();
    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }]
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return await order.updateStatus(status, notes);
  }

  async getOrdersByCustomer(customerId) {
    await this.initialize();
    return await Order.findByCustomer(customerId);
  }

  // Invoice Operations
  async getInvoices(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { invoiceDate: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Invoice.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('customer')
      .populate('order')
      .exec();
  }

  async getInvoiceById(id) {
    await this.initialize();
    return await Invoice.findOne({
      $or: [
        { _id: id },
        { invoiceId: id }
      ]
    }).populate('customer').populate('order');
  }

  async createInvoice(invoiceData) {
    await this.initialize();
    const invoice = new Invoice(invoiceData);
    return await invoice.save();
  }

  async addPaymentToInvoice(invoiceId, paymentData) {
    await this.initialize();
    const invoice = await Invoice.findOne({
      $or: [{ _id: invoiceId }, { invoiceId: invoiceId }]
    });
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return await invoice.addPayment(paymentData);
  }

  async getOverdueInvoices() {
    await this.initialize();
    return await Invoice.findOverdue();
  }

  // Analytics and Reports
  async getDashboardStats() {
    await this.initialize();
    
    const [
      totalCustomers,
      activeCustomers,
      totalInventoryValue,
      lowStockItems,
      recentOrders,
      pendingInvoices,
      overdueInvoices
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Inventory.getTotalValue(),
      Inventory.findLowStock(),
      Order.findRecentOrders(30),
      Invoice.countDocuments({ status: 'Pending' }),
      Invoice.findOverdue()
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers
      },
      inventory: {
        totalValue: totalInventoryValue[0]?.total || 0,
        lowStockCount: lowStockItems.length
      },
      orders: {
        recentCount: recentOrders.length,
        recentValue: recentOrders.reduce((sum, order) => sum + order.total, 0)
      },
      invoices: {
        pending: pendingInvoices,
        overdue: overdueInvoices.length,
        overdueValue: overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
      }
    };
  }

  // Data Migration Helpers
  async migrateData(collection, data) {
    await this.initialize();
    
    const modelMap = {
      customers: Customer,
      inventory: Inventory,
      suppliers: Supplier,
      orders: Order,
      invoices: Invoice
    };
    
    const Model = modelMap[collection];
    if (!Model) {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    const results = [];
    for (const item of data) {
      try {
        const document = new Model(item);
        const saved = await document.save();
        results.push({ success: true, id: saved._id, data: saved });
      } catch (error) {
        results.push({ success: false, error: error.message, data: item });
      }
    }
    
    return results;
  }

  async clearCollection(collection) {
    await this.initialize();
    
    const modelMap = {
      customers: Customer,
      inventory: Inventory,
      suppliers: Supplier,
      orders: Order,
      invoices: Invoice
    };
    
    const Model = modelMap[collection];
    if (!Model) {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    const result = await Model.deleteMany({});
    return result;
  }

  // Order Operations
  async getOrders(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { createdAt: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Order.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('customer')
      .populate('items.part')
      .exec();
  }

  async getOrderById(id) {
    await this.initialize();
    return await Order.findOne({
      $or: [
        { _id: id },
        { orderId: id }
      ]
    }).populate('customer').populate('items.part');
  }

  async createOrder(orderData) {
    await this.initialize();
    const order = new Order(orderData);
    return await order.save();
  }

  async updateOrder(id, updateData) {
    await this.initialize();
    return await Order.findOneAndUpdate(
      { $or: [{ _id: id }, { orderId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Invoice Operations
  async getInvoices(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { createdAt: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Invoice.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('customer')
      .populate('order')
      .exec();
  }

  async getInvoiceById(id) {
    await this.initialize();
    return await Invoice.findOne({
      $or: [
        { _id: id },
        { invoiceId: id }
      ]
    }).populate('customer').populate('order');
  }

  async createInvoice(invoiceData) {
    await this.initialize();
    const invoice = new Invoice(invoiceData);
    return await invoice.save();
  }

  async updateInvoice(id, updateData) {
    await this.initialize();
    return await Invoice.findOneAndUpdate(
      { $or: [{ _id: id }, { invoiceId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Shipment Operations
  async getShipments(query = {}, options = {}) {
    await this.initialize();
    const { limit = 100, sort = { createdAt: -1 }, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await Shipment.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('order')
      .populate('customer')
      .exec();
  }

  async getShipmentById(id) {
    await this.initialize();
    return await Shipment.findOne({
      $or: [
        { _id: id },
        { shipmentId: id }
      ]
    }).populate('order').populate('customer');
  }

  async createShipment(shipmentData) {
    await this.initialize();
    const shipment = new Shipment(shipmentData);
    return await shipment.save();
  }

  async updateShipment(id, updateData) {
    await this.initialize();
    return await Shipment.findOneAndUpdate(
      { $or: [{ _id: id }, { shipmentId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Payment Operations
  async createPayment(paymentData) {
    await this.initialize();
    // For now, just return a mock payment record
    // In a real implementation, you'd have a Payment model
    return {
      ...paymentData,
      paymentId: paymentData.paymentId || `PAY${Date.now()}`,
      status: 'Completed',
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Health Check
  async healthCheck() {
    try {
      await this.initialize();
      const status = mongoConnection.getConnectionStatus();
      
      const collections = await Promise.all([
        Customer.countDocuments(),
        Inventory.countDocuments(),
        Supplier.countDocuments(),
        Order.countDocuments(),
        Invoice.countDocuments()
      ]);
      
      return {
        status: 'healthy',
        connection: status,
        collections: {
          customers: collections[0],
          inventory: collections[1],
          suppliers: collections[2],
          orders: collections[3],
          invoices: collections[4]
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;