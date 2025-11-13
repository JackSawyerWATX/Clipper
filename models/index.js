// MongoDB Models Export
// Centralized export for all database models

import Customer from './Customer.js';
import Inventory from './Inventory.js';
import Supplier from './Supplier.js';
import Order from './Order.js';
import Invoice from './Invoice.js';
import Shipment from './Shipment.js';

export {
  Customer,
  Inventory,
  Supplier,
  Order,
  Invoice,
  Shipment
};

export default {
  Customer,
  Inventory,
  Supplier,
  Order,
  Invoice
};