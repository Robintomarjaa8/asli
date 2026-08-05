import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no MongoDB URI is provided, use in-memory MongoDB (development only)
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('MONGODB_URI is required in production environment!');
        process.exit(1);
      }
      console.log('No MONGODB_URI found. Starting in-memory MongoDB...');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log(`In-memory MongoDB started at ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle shutdown
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      if (memoryServer) {
        await memoryServer.stop();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;