import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  directPhone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
});

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  customerSince: {
    type: Date,
    default: Date.now
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'],
    default: 'Net 30'
  },
  primaryContact: {
    type: contactSchema,
    required: false
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'customers'
});

// Indexes for better query performance
customerSchema.index({ companyName: 1, email: 1 });
customerSchema.index({ status: 1, customerSince: -1 });
customerSchema.index({ totalSpent: -1 });

// Virtual for customer age in days
customerSchema.virtual('customerAge').get(function() {
  return Math.floor((Date.now() - this.customerSince) / (1000 * 60 * 60 * 24));
});

// Static methods
customerSchema.statics.findActiveCustomers = function() {
  return this.find({ status: 'Active' });
};

customerSchema.statics.findTopCustomers = function(limit = 10) {
  return this.find({ status: 'Active' })
    .sort({ totalSpent: -1 })
    .limit(limit);
};

// Instance methods
customerSchema.methods.addOrder = function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  return this.save();
};

customerSchema.methods.updateCreditStatus = function(newLimit) {
  this.creditLimit = newLimit;
  return this.save();
};

// Pre-save middleware
customerSchema.pre('save', function(next) {
  if (this.isNew && !this.customerId) {
    // Generate customer ID if not provided
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.customerId = `CUST${timestamp}${random}`.toUpperCase();
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;