# MongoDB Setup Guide for Clipper Aviation

This guide will help you set up MongoDB for your Clipper Aviation logistics application.

## Quick Start

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 free tier is sufficient for development)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update .env File**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipper-aviation?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

1. **Install MongoDB Community Server**
   
   **Windows:**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Run the installer
   - Choose "Complete" setup
   - Install as a Windows Service
   - Install MongoDB Compass (GUI tool)

   **macOS:**
   ```bash
   # Using Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   # Import MongoDB GPG key
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   
   # Add MongoDB repository
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   
   # Install MongoDB
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Verify Installation**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Should show MongoDB shell prompt
   # Type 'exit' to quit
   ```

3. **Keep Default .env Settings**
   ```env
   MONGODB_URI=mongodb://localhost:27017/clipper-aviation
   ```

## Data Migration

Once MongoDB is set up, migrate your existing data:

### 1. Check Current Data
```bash
npm run db:dry-run
```

### 2. Perform Migration
```bash
# Migrate data (keeps existing if any)
npm run db:migrate

# OR migrate with fresh start (clears existing data)
npm run db:migrate:clear
```

### 3. Verify Migration
```bash
npm run db:health
```

## Database Operations

### Available Scripts
```bash
# Check database health and connection
npm run db:health

# Perform dry run analysis
npm run db:dry-run

# Migrate data to MongoDB
npm run db:migrate

# Migrate with fresh start (clears existing)
npm run db:migrate:clear

# Clear all collections
npm run db:clear
```

### Manual Operations
```bash
# Connect to MongoDB shell
mongosh clipper-aviation

# Show all collections
show collections

# Count documents in each collection
db.customers.countDocuments()
db.inventory.countDocuments()
db.suppliers.countDocuments()
db.orders.countDocuments()
db.invoices.countDocuments()

# Query examples
db.customers.find({ status: "Active" }).limit(5)
db.inventory.find({ inStock: { $lte: 10 } })
db.suppliers.find({ reliabilityRating: { $gte: 4.5 } })
```

## Database Schema Overview

### Collections Structure

**Customers**
- Customer management with contact details
- Order history and spending tracking
- Credit limits and payment terms
- Primary and secondary contacts

**Inventory**
- Aircraft parts with detailed specifications
- Stock levels and minimum thresholds
- Supplier relationships
- Location tracking and certifications

**Suppliers**
- Supplier network management
- Performance ratings and metrics
- Certifications and specializations
- Delivery times and payment terms

**Orders**
- Complete order lifecycle management
- Customer and shipping information
- Item details and pricing
- Status tracking and updates

**Invoices**
- Invoice generation and management
- Payment tracking and history
- Overdue monitoring
- Customer billing details

## Production Considerations

### Security
1. **Enable Authentication**
   ```javascript
   // MongoDB connection with auth
   mongodb://username:password@localhost:27017/clipper-aviation
   ```

2. **Use SSL/TLS**
   ```javascript
   // For production
   mongodb+srv://user:pass@cluster.mongodb.net/clipper-aviation?ssl=true
   ```

### Performance
1. **Indexes** - Already configured in models
2. **Connection Pooling** - Configured in mongodb.js
3. **Query Optimization** - Built into service layer

### Backup Strategy
```bash
# Create backup
mongodump --db clipper-aviation --out ./backup

# Restore backup
mongorestore --db clipper-aviation ./backup/clipper-aviation
```

### Monitoring
- Use MongoDB Compass for GUI management
- Monitor slow queries and performance
- Set up alerts for critical operations

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: connect ECONNREFUSED
   ```
   - Check if MongoDB is running: `sudo systemctl status mongod`
   - Verify connection string in .env file
   - Check firewall settings

2. **Authentication Failed**
   ```
   Error: Authentication failed
   ```
   - Verify username/password in connection string
   - Check user permissions in MongoDB

3. **Migration Errors**
   ```
   ValidationError: Path `name` is required
   ```
   - Run dry-run first to identify issues: `npm run db:dry-run`
   - Check data format in static files
   - Review model validation requirements

### Getting Help

1. **Check Application Logs**
   ```bash
   # Check Node.js application logs
   npm run start:web
   ```

2. **MongoDB Logs**
   ```bash
   # Linux/macOS
   tail -f /var/log/mongodb/mongod.log
   
   # Windows
   # Check Windows Event Viewer under Applications
   ```

3. **Database Health Check**
   ```bash
   npm run db:health
   ```

## Next Steps

After successful MongoDB setup:

1. **Update Application Components** - Components will automatically use MongoDB through the DatabaseService
2. **Test CRUD Operations** - Verify create, read, update, delete operations
3. **Set Up Backup Schedule** - Implement regular backups for production
4. **Monitor Performance** - Set up monitoring and alerting
5. **Scale as Needed** - Consider sharding for large datasets

---

**Need Help?** Check the MongoDB documentation or create an issue in the project repository.