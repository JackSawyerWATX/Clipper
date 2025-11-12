import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    },
    full: String // For backward compatibility
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  fax: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  contactTitle: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  establishedSince: {
    type: Date,
    required: true
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0
  },
  reliabilityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'],
    default: 'Net 30'
  },
  deliveryTime: {
    min: {
      type: Number,
      default: 7
    },
    max: {
      type: Number,
      default: 14
    },
    unit: {
      type: String,
      enum: ['days', 'weeks'],
      default: 'days'
    },
    description: String // For backward compatibility like "7-10 days"
  },
  certifications: [{
    name: String,
    issuedBy: String,
    certificationNumber: String,
    issuedDate: Date,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending Approval'],
    default: 'Active'
  },
  preferredSupplier: {
    type: Boolean,
    default: false
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountTiers: [{
    minimumAmount: Number,
    discountPercentage: Number,
    description: String
  }],
  shippingMethods: [{
    method: String,
    cost: Number,
    estimatedDays: Number
  }],
  qualityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  lastOrderDate: {
    type: Date
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
  timestamps: true,
  collection: 'suppliers'
});

// Indexes for better performance
supplierSchema.index({ companyName: 1, status: 1 });
supplierSchema.index({ specialization: 1, reliabilityRating: -1 });
supplierSchema.index({ status: 1, preferredSupplier: -1 });
supplierSchema.index({ 'certifications.name': 1, 'certifications.isActive': 1 });

// Virtual properties
supplierSchema.virtual('averageOrderValue').get(function() {
  return this.totalOrders > 0 ? this.totalPurchases / this.totalOrders : 0;
});

supplierSchema.virtual('partnershipAge').get(function() {
  return Math.floor((Date.now() - this.establishedSince) / (1000 * 60 * 60 * 24));
});

supplierSchema.virtual('deliveryTimeString').get(function() {
  if (this.deliveryTime.description) {
    return this.deliveryTime.description;
  }
  const { min, max, unit } = this.deliveryTime;
  return `${min}-${max} ${unit}`;
});

supplierSchema.virtual('fullAddress').get(function() {
  if (this.address.full) {
    return this.address.full;
  }
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Static methods
supplierSchema.statics.findActiveSuppliers = function() {
  return this.find({ status: 'Active' });
};

supplierSchema.statics.findPreferredSuppliers = function() {
  return this.find({ 
    status: 'Active',
    preferredSupplier: true 
  });
};

supplierSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ 
    specialization: new RegExp(specialization, 'i'),
    status: 'Active'
  });
};

supplierSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ status: 'Active' })
    .sort({ reliabilityRating: -1, qualityScore: -1 })
    .limit(limit);
};

supplierSchema.statics.searchSuppliers = function(query) {
  return this.find({
    $and: [
      { status: 'Active' },
      {
        $or: [
          { companyName: new RegExp(query, 'i') },
          { specialization: new RegExp(query, 'i') },
          { location: new RegExp(query, 'i') },
          { contactName: new RegExp(query, 'i') }
        ]
      }
    ]
  });
};

// Instance methods
supplierSchema.methods.addOrder = function(orderValue) {
  this.totalOrders += 1;
  this.totalPurchases += orderValue;
  this.lastOrderDate = new Date();
  return this.save();
};

supplierSchema.methods.updateRating = function(newRating, qualityScore = null) {
  this.reliabilityRating = Math.max(1, Math.min(5, newRating));
  if (qualityScore !== null) {
    this.qualityScore = Math.max(1, Math.min(10, qualityScore));
  }
  return this.save();
};

supplierSchema.methods.addCertification = function(certification) {
  this.certifications.push(certification);
  return this.save();
};

supplierSchema.methods.getActiveCertifications = function() {
  return this.certifications.filter(cert => 
    cert.isActive && (!cert.expiryDate || cert.expiryDate > new Date())
  );
};

// Pre-save middleware
supplierSchema.pre('save', function(next) {
  // Auto-generate supplierId if not provided
  if (this.isNew && !this.supplierId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.supplierId = `SUP${timestamp}${random}`.toUpperCase();
  }
  
  // Ensure backward compatibility for address
  if (this.address && !this.address.full && this.location) {
    this.address.full = this.location;
  }
  
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;