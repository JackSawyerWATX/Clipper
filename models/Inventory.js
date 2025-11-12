import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  partId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  partNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  weight: {
    type: String,
    trim: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['in', 'cm', 'mm'],
      default: 'in'
    }
  },
  inStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  maximumStock: {
    type: Number,
    min: 0
  },
  location: {
    warehouse: {
      type: String,
      trim: true,
      default: 'Main'
    },
    zone: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    index: true
  },
  supplierName: {
    type: String,
    trim: true
  },
  certifications: [{
    name: String,
    number: String,
    expiryDate: Date
  }],
  specifications: [{
    name: String,
    value: String,
    unit: String
  }],
  condition: {
    type: String,
    enum: ['New', 'Refurbished', 'Used', 'Overhauled'],
    default: 'New'
  },
  status: {
    type: String,
    enum: ['Active', 'Discontinued', 'Backordered', 'Out of Stock'],
    default: 'Active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastRestocked: {
    type: Date
  },
  totalSold: {
    type: Number,
    default: 0,
    min: 0
  },
  averageMonthlySales: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'inventory'
});

// Compound indexes for common queries
inventorySchema.index({ category: 1, manufacturer: 1 });
inventorySchema.index({ inStock: 1, minimumStock: 1 });
inventorySchema.index({ status: 1, condition: 1 });
inventorySchema.index({ partNumber: 1, manufacturer: 1 });

// Virtual properties
inventorySchema.virtual('stockStatus').get(function() {
  if (this.inStock === 0) return 'Out of Stock';
  if (this.inStock <= this.minimumStock) return 'Low Stock';
  if (this.maximumStock && this.inStock >= this.maximumStock) return 'Overstock';
  return 'In Stock';
});

inventorySchema.virtual('locationString').get(function() {
  const loc = this.location;
  return [loc.warehouse, loc.zone, loc.shelf, loc.position]
    .filter(Boolean)
    .join('-') || 'Not Specified';
});

inventorySchema.virtual('stockValue').get(function() {
  return this.inStock * this.price;
});

// Static methods
inventorySchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$inStock', '$minimumStock'] },
    status: 'Active'
  });
};

inventorySchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: new RegExp(category, 'i'),
    status: 'Active'
  });
};

inventorySchema.statics.findByManufacturer = function(manufacturer) {
  return this.find({ 
    manufacturer: new RegExp(manufacturer, 'i'),
    status: 'Active'
  });
};

inventorySchema.statics.getTotalValue = function() {
  return this.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$inStock', '$price'] } } } }
  ]);
};

inventorySchema.statics.searchParts = function(query) {
  return this.find({
    $and: [
      { status: 'Active' },
      {
        $or: [
          { name: new RegExp(query, 'i') },
          { partNumber: new RegExp(query, 'i') },
          { manufacturer: new RegExp(query, 'i') },
          { category: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') }
        ]
      }
    ]
  });
};

// Instance methods
inventorySchema.methods.adjustStock = function(quantity, reason = 'Manual Adjustment') {
  const oldStock = this.inStock;
  this.inStock = Math.max(0, this.inStock + quantity);
  this.lastUpdated = new Date();
  
  if (quantity > 0) {
    this.lastRestocked = new Date();
  }
  
  return this.save().then(() => {
    return {
      oldStock,
      newStock: this.inStock,
      adjustment: quantity,
      reason
    };
  });
};

inventorySchema.methods.recordSale = function(quantity) {
  this.inStock = Math.max(0, this.inStock - quantity);
  this.totalSold += quantity;
  this.lastUpdated = new Date();
  return this.save();
};

inventorySchema.methods.updatePrice = function(newPrice) {
  this.price = newPrice;
  this.lastUpdated = new Date();
  return this.save();
};

// Pre-save middleware
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Auto-generate partId if not provided
  if (this.isNew && !this.partId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.partId = `AC${timestamp}${random}`.toUpperCase();
  }
  
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;