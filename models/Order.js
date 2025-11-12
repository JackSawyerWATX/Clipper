import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  partId: {
    type: String,
    required: true,
    trim: true
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  },
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  notes: {
    type: String,
    trim: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'United States',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  requiredDate: {
    type: Date
  },
  shippedDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed', 
      'Processing', 
      'Picking', 
      'Packed', 
      'Shipped', 
      'Delivered', 
      'Cancelled',
      'On Hold',
      'Backordered'
    ],
    default: 'Pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'Medium', 'High', 'Critical'],
    default: 'Normal'
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.08,
    min: 0,
    max: 1
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'],
    default: 'Net 30'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Refunded'],
    default: 'Pending'
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: {
    type: shippingAddressSchema
  },
  shippingMethod: {
    carrier: {
      type: String,
      enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'Freight', 'Local Delivery', 'Customer Pickup'],
      default: 'UPS'
    },
    service: {
      type: String,
      default: 'Ground'
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    }
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['Web', 'Phone', 'Email', 'Fax', 'Sales Rep', 'API'],
    default: 'Web'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'orders'
});

// Indexes for performance
orderSchema.index({ orderDate: -1, status: 1 });
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ status: 1, priority: 1 });
orderSchema.index({ shippedDate: 1, status: 1 });

// Virtual properties
orderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Delivered' || this.status === 'Cancelled') {
    return false;
  }
  return this.requiredDate && this.requiredDate < new Date();
});

orderSchema.virtual('daysOld').get(function() {
  return Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
});

orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Static methods
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ orderDate: -1 });
};

orderSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId }).sort({ orderDate: -1 });
};

orderSchema.statics.findOverdue = function() {
  return this.find({
    requiredDate: { $lt: new Date() },
    status: { $nin: ['Delivered', 'Cancelled'] }
  });
};

orderSchema.statics.findRecentOrders = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    orderDate: { $gte: startDate }
  }).sort({ orderDate: -1 });
};

orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);
};

// Instance methods
orderSchema.methods.addItem = function(item) {
  this.items.push(item);
  this.calculateTotals();
  return this.save();
};

orderSchema.methods.removeItem = function(itemId) {
  this.items.id(itemId).remove();
  this.calculateTotals();
  return this.save();
};

orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'Shipped' && !this.shippedDate) {
    this.shippedDate = new Date();
  }
  
  if (newStatus === 'Delivered' && !this.deliveryDate) {
    this.deliveryDate = new Date();
  }
  
  if (notes) {
    this.internalNotes = (this.internalNotes || '') + `\n${new Date().toISOString()}: ${notes}`;
  }
  
  return this.save();
};

orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.totalPrice - (item.discount.amount || 0));
  }, 0);
  
  this.taxAmount = this.subtotal * this.taxRate;
  this.total = this.subtotal + this.taxAmount + this.shippingCost - this.discount;
  
  return this;
};

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Auto-generate orderId if not provided
  if (this.isNew && !this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderId = `ORD${timestamp}${random}`.toUpperCase();
  }
  
  // Recalculate totals
  this.calculateTotals();
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;