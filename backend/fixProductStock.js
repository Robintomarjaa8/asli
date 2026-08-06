import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required to run this script.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

const DEFAULT_STOCK = 100;

const fixProductStock = async () => {
  try {
    await connectDB();

    // Use raw collection to bypass Mongoose casting.
    // NaN is stored as a number type in MongoDB. NaN comparisons (like $lt) are
    // always false, so we match it with $not: { $gte: 0 } (NaN >= 0 is false).
    const collection = mongoose.connection.collection('products');

    // Find products where inventory.stock is NaN, 0, negative, or missing
    const cursor = collection.find({
      $or: [
        { 'inventory.stock': { $type: 'number', $not: { $gte: 0 } } }, // NaN or negative
        { 'inventory.stock': { $type: 'number', $lt: 1 } }, // 0
        { 'inventory.stock': { $exists: false } }, // missing
        { 'inventory.stock': null }, // null
      ],
    });

    const products = await cursor.toArray();
    console.log(`Found ${products.length} product(s) with zero/invalid stock.`);

    let fixed = 0;
    for (const product of products) {
      const oldStock = product.inventory?.stock;
      await collection.updateOne(
        { _id: product._id },
        {
          $set: {
            'inventory.stock': DEFAULT_STOCK,
            'inventory.status': DEFAULT_STOCK <= 5 ? 'low_stock' : 'in_stock',
          },
        }
      );
      fixed++;
      console.log(`Fixed: ${product.name} (stock ${oldStock} -> ${DEFAULT_STOCK})`);
    }

    console.log(`\nDone! Fixed ${fixed} product(s).`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fixProductStock();