import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  partId: {
    type: String,
    required: true,
    trim: true
  },
  partName: {
    type: String,
    required: true,
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
  }
});

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['Wire Transfer', 'Credit Card', 'Check', 'ACH', 'Cash', 'Other'],
    required: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    trim: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  orderId: {
    type: String,
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
  billingAddress: {
    name: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    }
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Refunded', 'Scheduled'],
    default: 'Pending',
    index: true
  },
  items: [invoiceItemSchema],
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
    required: true,
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
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  amountDue: {
    type: Number,
    required: true,
    min: 0
  },
  payments: [paymentSchema],
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'],
    default: 'Net 30'
  },
  lateFeeRate: {
    type: Number,
    default: 0.015, // 1.5% per month
    min: 0
  },
  lateFeeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
  sentDate: {
    type: Date
  },
  remindersSent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastReminderDate: {
    type: Date
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'invoices'
});

// Indexes for performance
invoiceSchema.index({ invoiceDate: -1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ customerId: 1, invoiceDate: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

// Virtual properties
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status === 'Pending' && this.dueDate < new Date();
});

invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  return Math.floor((Date.now() - this.dueDate) / (1000 * 60 * 60 * 24));
});

invoiceSchema.virtual('daysToDue').get(function() {
  return Math.floor((this.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
});

invoiceSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.invoiceDate) / (1000 * 60 * 60 * 24));
});

invoiceSchema.virtual('paymentPercentage').get(function() {
  return this.total > 0 ? (this.amountPaid / this.total) * 100 : 0;
});

// Static methods
invoiceSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ invoiceDate: -1 });
};

invoiceSchema.statics.findOverdue = function() {
  return this.find({
    status: 'Pending',
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

invoiceSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId }).sort({ invoiceDate: -1 });
};

invoiceSchema.statics.findDueInDays = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'Pending',
    dueDate: { $lte: futureDate, $gte: new Date() }
  }).sort({ dueDate: 1 });
};

invoiceSchema.statics.getInvoiceStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' },
        totalPaid: { $sum: '$amountPaid' }
      }
    }
  ]);
};

invoiceSchema.statics.getAgedReceivables = function() {
  return this.aggregate([
    {
      $match: {
        status: { $in: ['Pending', 'Partial', 'Overdue'] }
      }
    },
    {
      $addFields: {
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), '$invoiceDate'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$ageInDays',
        boundaries: [0, 30, 60, 90, 120, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountDue' }
        }
      }
    }
  ]);
};

// Instance methods
invoiceSchema.methods.addPayment = function(payment) {
  payment.paymentId = payment.paymentId || `PAY${Date.now()}`;
  this.payments.push(payment);
  
  this.amountPaid += payment.amount;
  this.amountDue = Math.max(0, this.total - this.amountPaid);
  this.lastPaymentDate = payment.paymentDate;
  
  // Update status based on payment
  if (this.amountPaid >= this.total) {
    this.status = 'Paid';
    this.paidDate = payment.paymentDate;
  } else if (this.amountPaid > 0) {
    this.status = 'Partial';
  }
  
  return this.save();
};

invoiceSchema.methods.calculateLateFee = function() {
  if (!this.isOverdue || this.status === 'Paid') {
    return 0;
  }
  
  const monthsOverdue = this.daysOverdue / 30;
  this.lateFeeAmount = this.amountDue * this.lateFeeRate * monthsOverdue;
  return this.lateFeeAmount;
};

invoiceSchema.methods.sendReminder = function() {
  this.remindersSent += 1;
  this.lastReminderDate = new Date();
  
  if (this.status === 'Pending' && this.isOverdue) {
    this.status = 'Overdue';
  }
  
  return this.save();
};

invoiceSchema.methods.markAsSent = function() {
  this.status = 'Sent';
  this.sentDate = new Date();
  return this.save();
};

invoiceSchema.methods.void = function(reason = '') {
  this.status = 'Cancelled';
  if (reason) {
    this.internalNotes = (this.internalNotes || '') + `\nVoided: ${reason}`;
  }
  return this.save();
};

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Auto-generate invoiceId if not provided
  if (this.isNew && !this.invoiceId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.invoiceId = `INV${timestamp}${random}`.toUpperCase();
  }
  
  // Generate invoice number if not provided
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${year}-${month}-${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.totalPrice - (item.discount.amount || 0));
  }, 0);
  
  this.taxAmount = this.subtotal * this.taxRate;
  this.total = this.subtotal + this.taxAmount + this.shippingCost - this.discount;
  this.amountDue = Math.max(0, this.total - this.amountPaid);
  
  // Set due date based on payment terms
  if (this.isNew && !this.dueDate) {
    const daysToAdd = {
      'Net 15': 15,
      'Net 30': 30,
      'Net 45': 45,
      'Net 60': 60,
      'COD': 0,
      'Prepaid': 0
    };
    
    const days = daysToAdd[this.paymentTerms] || 30;
    this.dueDate = new Date(this.invoiceDate);
    this.dueDate.setDate(this.dueDate.getDate() + days);
  }
  
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;