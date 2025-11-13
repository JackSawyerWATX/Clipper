import mongoose from 'mongoose';

const shipmentItemSchema = new mongoose.Schema({
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
  }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  items: [shipmentItemSchema],
  status: {
    type: String,
    enum: ['Processing', 'Pending', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true,
    default: 'UPS'
  },
  shippingAddress: {
    type: String,
    required: true,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingCost: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shipmentSchema.index({ shipmentId: 1 });
shipmentSchema.index({ order: 1 });
shipmentSchema.index({ customer: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });

// Virtual for total value
shipmentSchema.virtual('totalValue').get(function() {
  return this.items.reduce((total, item) => total + item.totalPrice, 0);
});

// Instance method to update status
shipmentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Delivered') {
    this.actualDelivery = new Date();
  }
  return this.save();
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;