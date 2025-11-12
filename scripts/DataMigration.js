import { databaseService } from '../services/DatabaseService.js';

// Import existing data
import { customersData } from '../data/customersData.js';
import { aircraftPartsInventory } from '../data/aircraftInventory.js';
import { suppliersData } from '../data/suppliersData.js';
import { invoicesData } from '../data/invoicesData.js';
import { ordersData } from '../data/shippingData.js';

class DataMigration {
  constructor() {
    this.migrationResults = {};
  }

  async migrateAllData(options = {}) {
    const { clearExisting = false, dryRun = false } = options;
    
    console.log('🚀 Starting data migration to MongoDB...');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}${clearExisting ? ' (Clear Existing)' : ''}`);
    
    try {
      if (dryRun) {
        return this.performDryRun();
      }

      // Initialize database connection for live migration
      await databaseService.initialize();
      
      if (clearExisting) {
        await this.clearAllCollections();
      }
      
      // Migrate data in order (due to dependencies)
      await this.migrateSuppliers();
      await this.migrateCustomers();
      await this.migrateInventory();
      await this.migrateOrders();
      await this.migrateInvoices();
      
      console.log('✅ Data migration completed successfully!');
      return this.generateMigrationReport();
      
    } catch (error) {
      if (dryRun) {
        // For dry run, we don't need MongoDB connection
        console.error('❌ Dry run failed:', error.message);
      } else {
        console.error('❌ Migration failed:', error);
      }
      throw error;
    }
  }

  async performDryRun() {
    console.log('📊 Performing dry run analysis...');
    console.log('ℹ️  This analysis runs without connecting to MongoDB\n');
    
    const analysis = {
      suppliers: this.analyzeSuppliersData(),
      customers: this.analyzeCustomersData(),
      inventory: this.analyzeInventoryData(),
      orders: this.analyzeOrdersData(),
      invoices: this.analyzeInvoicesData()
    };
    
    console.log('📋 Dry Run Results:');
    console.log('==================');
    
    let totalRecords = 0;
    let totalIssues = 0;
    
    Object.entries(analysis).forEach(([collection, data]) => {
      totalRecords += data.count;
      totalIssues += data.issues;
      
      const status = data.issues === 0 ? '✅' : '⚠️';
      console.log(`${status} ${collection.toUpperCase()}: ${data.count} records, ${data.issues} potential issues`);
      
      if (data.details && data.details.length > 0) {
        data.details.forEach(detail => {
          console.log(`   - ${detail}`);
        });
      }
    });
    
    console.log('==================');
    console.log(`📊 SUMMARY: ${totalRecords} total records, ${totalIssues} potential issues`);
    
    if (totalIssues === 0) {
      console.log('🎉 All data looks good for migration!');
    } else {
      console.log('⚠️  Please review and fix the issues above before migration.');
    }
    
    return analysis;
  }

  async clearAllCollections() {
    console.log('🧹 Clearing existing collections...');
    
    const collections = ['customers', 'inventory', 'suppliers', 'orders', 'invoices'];
    
    for (const collection of collections) {
      try {
        const result = await databaseService.clearCollection(collection);
        console.log(`  ✅ Cleared ${collection}: ${result.deletedCount} documents`);
      } catch (error) {
        console.error(`  ❌ Failed to clear ${collection}:`, error.message);
      }
    }
  }

  async migrateSuppliers() {
    console.log('📦 Migrating suppliers...');
    
    const mappedData = suppliersData.map(supplier => ({
      supplierId: supplier.id,
      companyName: supplier.companyName,
      location: supplier.location,
      address: {
        full: supplier.address
      },
      phone: supplier.phone,
      contactName: supplier.contactName,
      contactEmail: supplier.contactEmail,
      specialization: supplier.specialization,
      establishedSince: new Date(supplier.establishedSince),
      totalOrders: supplier.totalOrders || 0,
      reliabilityRating: supplier.reliabilityRating || 3,
      paymentTerms: supplier.paymentTerms || 'Net 30',
      deliveryTime: {
        description: supplier.deliveryTime
      },
      certifications: (supplier.certifications || []).map(cert => ({
        name: cert,
        isActive: true
      })),
      status: 'Active'
    }));

    const results = await databaseService.migrateData('suppliers', mappedData);
    this.migrationResults.suppliers = results;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  ✅ Suppliers: ${successful} successful, ${failed} failed`);
  }

  async migrateCustomers() {
    console.log('👥 Migrating customers...');
    
    const mappedData = customersData.map(customer => ({
      customerId: customer.id,
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      customerSince: new Date(customer.customerSince),
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      status: customer.status || 'Active',
      creditLimit: customer.creditLimit || 0,
      paymentTerms: customer.paymentTerms || 'Net 30',
      primaryContact: customer.primaryContact || null
    }));

    const results = await databaseService.migrateData('customers', mappedData);
    this.migrationResults.customers = results;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  ✅ Customers: ${successful} successful, ${failed} failed`);
  }

  async migrateInventory() {
    console.log('📦 Migrating inventory...');
    
    // Get suppliers for reference
    const suppliers = await databaseService.getSuppliers();
    const supplierMap = {};
    suppliers.forEach(sup => {
      supplierMap[sup.companyName] = sup._id;
    });
    
    const mappedData = aircraftPartsInventory.map(item => ({
      partId: item.id,
      name: item.name,
      manufacturer: item.manufacturer,
      category: item.category,
      description: item.description,
      photo: item.photo,
      price: item.price,
      partNumber: item.partNumber,
      weight: item.weight,
      inStock: item.inStock || 0,
      minimumStock: item.minimumStock || 1,
      location: {
        position: item.location
      },
      supplier: supplierMap[item.supplier] || null,
      supplierName: item.supplier,
      lastUpdated: new Date(item.lastUpdated || Date.now()),
      status: 'Active'
    }));

    const results = await databaseService.migrateData('inventory', mappedData);
    this.migrationResults.inventory = results;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  ✅ Inventory: ${successful} successful, ${failed} failed`);
  }

  async migrateOrders() {
    console.log('📋 Migrating orders...');
    
    if (!ordersData || ordersData.length === 0) {
      console.log('  ⚠️ No orders data found to migrate');
      this.migrationResults.orders = [];
      return;
    }
    
    // Get customers for reference
    const customers = await databaseService.getCustomers();
    const customerMap = {};
    customers.forEach(cust => {
      customerMap[cust.companyName] = {
        id: cust._id,
        customerId: cust.customerId,
        email: cust.email
      };
    });
    
    const mappedData = ordersData.map(order => {
      const customer = customerMap[order.customerName] || {};
      
      return {
        orderId: order.id,
        customer: customer.id || null,
        customerId: customer.customerId || 'UNKNOWN',
        customerName: order.customerName,
        customerEmail: customer.email || 'unknown@example.com',
        orderDate: new Date(order.orderDate || Date.now()),
        status: order.status || 'Pending',
        priority: order.priority || 'Normal',
        items: (order.items || []).map(item => ({
          partId: item.partId,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total || (item.quantity * item.unitPrice)
        })),
        subtotal: order.subtotal || 0,
        taxAmount: order.tax || 0,
        total: order.total || 0,
        paymentTerms: order.paymentTerms || 'Net 30',
        shippingAddress: {
          name: order.customerName,
          address1: order.shippingAddress || 'Address not provided',
          city: 'City',
          state: 'State',
          zipCode: '00000'
        }
      };
    });

    const results = await databaseService.migrateData('orders', mappedData);
    this.migrationResults.orders = results;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  ✅ Orders: ${successful} successful, ${failed} failed`);
  }

  async migrateInvoices() {
    console.log('🧾 Migrating invoices...');
    
    // Get customers and orders for reference
    const customers = await databaseService.getCustomers();
    const orders = await databaseService.getOrders();
    
    const customerMap = {};
    customers.forEach(cust => {
      customerMap[cust.companyName] = {
        id: cust._id,
        customerId: cust.customerId,
        email: cust.email
      };
    });
    
    const orderMap = {};
    orders.forEach(order => {
      orderMap[order.orderId] = order._id;
    });
    
    const mappedData = invoicesData.map(invoice => {
      const customer = customerMap[invoice.customerName] || {};
      
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.id,
        order: orderMap[invoice.orderId] || null,
        orderId: invoice.orderId,
        customer: customer.id || null,
        customerId: customer.customerId || 'UNKNOWN',
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail || customer.email || 'unknown@example.com',
        invoiceDate: new Date(invoice.invoiceDate),
        dueDate: new Date(invoice.dueDate),
        status: invoice.status || 'Pending',
        items: (invoice.items || []).map(item => ({
          partId: item.partId,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total
        })),
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.tax || 0,
        total: invoice.total || 0,
        amountPaid: invoice.status === 'Paid' ? invoice.total : 0,
        paymentTerms: invoice.terms || 'Net 30',
        paidDate: invoice.paidDate ? new Date(invoice.paidDate) : null,
        payments: invoice.paidDate ? [{
          paymentId: `PAY-${invoice.id}`,
          amount: invoice.total,
          method: invoice.paymentMethod || 'Unknown',
          paymentDate: new Date(invoice.paidDate)
        }] : []
      };
    });

    const results = await databaseService.migrateData('invoices', mappedData);
    this.migrationResults.invoices = results;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  ✅ Invoices: ${successful} successful, ${failed} failed`);
  }

  // Analysis methods for dry run
  analyzeSuppliersData() {
    const issues = [];
    const problematic = suppliersData.filter(s => {
      if (!s.companyName) {
        issues.push(`Supplier ${s.id}: Missing company name`);
        return true;
      }
      if (!s.contactEmail) {
        issues.push(`Supplier ${s.id}: Missing contact email`);
        return true;
      }
      return false;
    });

    return {
      count: suppliersData.length,
      issues: problematic.length,
      details: issues.slice(0, 5) // Show first 5 issues
    };
  }

  analyzeCustomersData() {
    const issues = [];
    const problematic = customersData.filter(c => {
      if (!c.companyName) {
        issues.push(`Customer ${c.id}: Missing company name`);
        return true;
      }
      if (!c.email) {
        issues.push(`Customer ${c.id}: Missing email`);
        return true;
      }
      return false;
    });

    return {
      count: customersData.length,
      issues: problematic.length,
      details: issues.slice(0, 5)
    };
  }

  analyzeInventoryData() {
    const issues = [];
    const problematic = aircraftPartsInventory.filter(i => {
      if (!i.name) {
        issues.push(`Inventory ${i.id}: Missing name`);
        return true;
      }
      if (!i.price || i.price <= 0) {
        issues.push(`Inventory ${i.id}: Missing or invalid price`);
        return true;
      }
      return false;
    });

    return {
      count: aircraftPartsInventory.length,
      issues: problematic.length,
      details: issues.slice(0, 5)
    };
  }

  analyzeOrdersData() {
    if (!ordersData || ordersData.length === 0) {
      return {
        count: 0,
        issues: 0,
        details: ['No orders data found - this is normal for a new system']
      };
    }

    const issues = [];
    const problematic = ordersData.filter(o => {
      if (!o.customerName) {
        issues.push(`Order ${o.id}: Missing customer name`);
        return true;
      }
      return false;
    });

    return {
      count: ordersData.length,
      issues: problematic.length,
      details: issues.slice(0, 5)
    };
  }

  analyzeInvoicesData() {
    const issues = [];
    const problematic = invoicesData.filter(i => {
      if (!i.customerName) {
        issues.push(`Invoice ${i.id}: Missing customer name`);
        return true;
      }
      if (!i.total || i.total <= 0) {
        issues.push(`Invoice ${i.id}: Missing or invalid total`);
        return true;
      }
      return false;
    });

    return {
      count: invoicesData.length,
      issues: problematic.length,
      details: issues.slice(0, 5)
    };
  }

  generateMigrationReport() {
    console.log('\n📊 Migration Report:');
    console.log('================================');
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    Object.entries(this.migrationResults).forEach(([collection, results]) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      totalSuccess += successful;
      totalFailed += failed;
      
      console.log(`${collection.toUpperCase()}:`);
      console.log(`  ✅ Successful: ${successful}`);
      console.log(`  ❌ Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('  Failed items:');
        results.filter(r => !r.success).forEach(item => {
          console.log(`    - ${item.error}`);
        });
      }
    });
    
    console.log('================================');
    console.log(`📊 TOTAL: ${totalSuccess} successful, ${totalFailed} failed`);
    
    return {
      summary: {
        totalSuccess,
        totalFailed
      },
      details: this.migrationResults
    };
  }
}

export const dataMigration = new DataMigration();
export default dataMigration;