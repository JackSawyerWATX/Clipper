import mongoose from 'mongoose';

class MongoDBConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    if (this.isConnected) {
      console.log('📊 MongoDB: Using existing connection');
      return this.connection;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clipper-aviation';
      
      console.log('📊 MongoDB: Connecting to database...');
      
      const connection = await mongoose.connect(mongoUri, {
        maxPoolSize: 10, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
      });

      this.isConnected = mongoose.connection.readyState === 1;
      this.connection = connection;

      console.log('✅ MongoDB: Connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB: Connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB: Disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB: Reconnected');
        this.isConnected = true;
      });

      return connection;
    } catch (error) {
      console.error('❌ MongoDB: Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('👋 MongoDB: Disconnected');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }
}

// Export singleton instance
export const mongoConnection = new MongoDBConnection();
export default mongoConnection;