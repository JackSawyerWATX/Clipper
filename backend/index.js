import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clipper';

app.use(cors());
app.use(express.json());


// Mongoose Supplier schema matching suppliersData.js
const supplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true, trim: true, index: true },
  companyName: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'United States' },
    full: String
  },
  phone: { type: String, required: true, trim: true },
  fax: { type: String, trim: true },
  contactName: { type: String, trim: true },
  contactEmail: { type: String, trim: true },
  specialization: { type: String, trim: true },
  paymentTerms: { type: String, trim: true },
  deliveryTime: { type: String, trim: true },
  certifications: [String],
  establishedSince: { type: String, trim: true },
  totalOrders: { type: Number, default: 0 },
  reliabilityRating: { type: Number, default: 0 },
});

const Supplier = mongoose.model('Supplier', supplierSchema);

// Connect to MongoDB
 mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API endpoint to get all suppliers
app.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// (Optional) API endpoint to add a supplier
app.post('/suppliers', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add supplier' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
});
