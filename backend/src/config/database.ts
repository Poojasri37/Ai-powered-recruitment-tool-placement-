import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri, {
      // Connection pool: allow up to 20 concurrent DB connections (default is 5)
      maxPoolSize: 20,
      minPoolSize: 5,
      // Timeout settings to prevent hanging connections
      serverSelectionTimeoutMS: 10000,  // 10s to find a server
      socketTimeoutMS: 45000,           // 45s socket timeout
      connectTimeoutMS: 15000,          // 15s initial connection timeout
      // Auto-retry on transient errors
      retryWrites: true,
    });

    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected, attempting reconnect...');
    });

    console.log('✓ MongoDB connected successfully (pool: 20)');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error);
  }
};
