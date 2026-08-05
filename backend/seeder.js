import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import Review from './models/Review.js';
import Order from './models/Order.js';

dotenv.config();

// Connect to DB (use in-memory if no MONGODB_URI)
const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found. Starting in-memory MongoDB...');
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

await connectDB();

const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Mobile phones, laptops, headphones, and more',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, accessories',
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, decor, kitchen appliances',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6',
    featured: true,
    sortOrder: 3,
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup, personal care',
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
    featured: true,
    sortOrder: 4,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Fitness equipment, sports gear',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    featured: true,
    sortOrder: 5,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books, magazines, e-books',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    featured: true,
    sortOrder: 6,
  },
  {
    name: 'Toys',
    slug: 'toys',
    description: 'Toys, games, educational',
    icon: '🧸',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7',
    featured: true,
    sortOrder: 7,
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Daily essentials, food, beverages',
    icon: '🛒',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    featured: true,
    sortOrder: 8,
  },
];

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Earbuds Pro',
    description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal clear sound quality. Features touch controls, IPX5 water resistance, and seamless connectivity.',
    price: 1999,
    mrp: 3999,
    brand: 'SoundMax',
    sku: 'EB-PRO-001',
    barcode: '8901234567890',
    tags: ['earbuds', 'wireless', 'bluetooth', 'audio'],
    specifications: [
      { key: 'Battery Life', value: '30 hours' },
      { key: 'Bluetooth Version', value: '5.3' },
      { key: 'Noise Cancellation', value: 'Active ANC' },
      { key: 'Water Resistance', value: 'IPX5' },
    ],
    colorVariants: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Blue', hex: '#0000ff' },
    ],
    inventory: { stock: 50, lowStockThreshold: 5 },
    isFeatured: true,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df', alt: 'Wireless Earbuds' },
      { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1', alt: 'Earbuds with case' },
    ],
    shippingDetails: { freeShipping: true, weight: 0.2 },
    warranty: '1 Year Warranty',
    returnPolicy: '7 days return policy',
  },
  {
    name: 'Smart Watch Fitness Tracker',
    description: 'Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 14-day battery life. Compatible with iOS and Android. Features a vibrant AMOLED display.',
    price: 2499,
    mrp: 4999,
    brand: 'TechFit',
    sku: 'SW-FT-002',
    barcode: '8901234567891',
    tags: ['smartwatch', 'fitness', 'tracker', 'wearable'],
    specifications: [
      { key: 'Display', value: '1.43" AMOLED' },
      { key: 'Battery', value: '14 days' },
      { key: 'GPS', value: 'Built-in' },
      { key: 'Water Rating', value: '5ATM' },
    ],
    colorVariants: [
      { name: 'Black', hex: '#000000' },
      { name: 'Silver', hex: '#c0c0c0' },
    ],
    inventory: { stock: 35, lowStockThreshold: 5 },
    isFeatured: true,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', alt: 'Smart Watch' },
      { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12', alt: 'Smart Watch on wrist' },
    ],
    shippingDetails: { freeShipping: true, weight: 0.3 },
    warranty: '1 Year Warranty',
    returnPolicy: '10 days return policy',
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft premium cotton t-shirt with a modern fit. Breathable fabric, perfect for everyday wear. Available in multiple colors and sizes.',
    price: 499,
    mrp: 999,
    brand: 'UrbanWear',
    sku: 'TS-COT-003',
    barcode: '8901234567892',
    tags: ['tshirt', 'cotton', 'fashion', 'clothing'],
    specifications: [
      { key: 'Material', value: '100% Cotton' },
      { key: 'Fit', value: 'Regular' },
      { key: 'Wash Care', value: 'Machine wash' },
    ],
    colorVariants: [
      { name: 'Red', hex: '#ff0000' },
      { name: 'Blue', hex: '#0000ff' },
      { name: 'Green', hex: '#008000' },
      { name: 'Black', hex: '#000000' },
    ],
    sizeVariants: [
      { size: 'S', price: 499, stock: 20 },
      { size: 'M', price: 499, stock: 25 },
      { size: 'L', price: 499, stock: 30 },
      { size: 'XL', price: 549, stock: 15 },
    ],
    inventory: { stock: 90, lowStockThreshold: 10 },
    isFeatured: true,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', alt: 'Cotton T-Shirt' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a', alt: 'T-Shirt front' },
    ],
    shippingDetails: { freeShipping: false, shippingCharges: 49, weight: 0.2 },
    returnPolicy: '30 days return policy',
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: 'Professional 10-piece stainless steel cookware set with induction compatible base. Includes frying pan, saucepans, and a spacious stockpot. Dishwasher safe.',
    price: 3499,
    mrp: 6999,
    brand: 'HomeChef',
    sku: 'CW-SS-004',
    barcode: '8901234567893',
    tags: ['cookware', 'kitchen', 'steel', 'home'],
    specifications: [
      { key: 'Material', value: 'Stainless Steel' },
      { key: 'Pieces', value: '10' },
      { key: 'Induction', value: 'Compatible' },
      { key: 'Dishwasher Safe', value: 'Yes' },
    ],
    inventory: { stock: 20, lowStockThreshold: 3 },
    isFeatured: false,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf', alt: 'Cookware Set' },
      { url: 'https://images.unsplash.com/photo-1584990347449-a1f4b2c6b0f5', alt: 'Kitchen pots' },
    ],
    shippingDetails: { freeShipping: true, shippingCharges: 0, weight: 5 },
    warranty: '2 Year Warranty',
    returnPolicy: '7 days return policy',
  },
  {
    name: 'Skincare Vitamin C Serum',
    description: 'Brightening vitamin C serum with hyaluronic acid and natural extracts. Reduces dark spots, improves skin texture, and gives a radiant glow. Dermatologist tested.',
    price: 599,
    mrp: 1299,
    brand: 'GlowLab',
    sku: 'SK-VC-005',
    barcode: '8901234567894',
    tags: ['skincare', 'serum', 'beauty', 'vitamin c'],
    specifications: [
      { key: 'Volume', value: '30ml' },
      { key: 'Skin Type', value: 'All skin types' },
      { key: 'Key Ingredients', value: 'Vitamin C, Hyaluronic Acid' },
    ],
    inventory: { stock: 100, lowStockThreshold: 15 },
    isFeatured: false,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', alt: 'Vitamin C Serum' },
      { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b', alt: 'Skincare products' },
    ],
    shippingDetails: { freeShipping: false, shippingCharges: 29, weight: 0.1 },
    returnPolicy: 'No return on cosmetics',
  },
  {
    name: 'Yoga Mat Premium Non-Slip',
    description: 'Extra-thick non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Perfect for yoga, pilates, and home workouts. Includes carry strap.',
    price: 799,
    mrp: 1599,
    brand: 'FitFlow',
    sku: 'YM-TPE-006',
    barcode: '8901234567895',
    tags: ['yoga', 'fitness', 'mat', 'exercise'],
    specifications: [
      { key: 'Material', value: 'TPE' },
      { key: 'Thickness', value: '8mm' },
      { key: 'Size', value: '183 x 61 cm' },
    ],
    colorVariants: [
      { name: 'Purple', hex: '#800080' },
      { name: 'Blue', hex: '#0000ff' },
      { name: 'Green', hex: '#008000' },
    ],
    inventory: { stock: 60, lowStockThreshold: 10 },
    isFeatured: false,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2', alt: 'Yoga Mat' },
      { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', alt: 'Yoga exercise' },
    ],
    shippingDetails: { freeShipping: true, weight: 1 },
    returnPolicy: '10 days return policy',
  },
  {
    name: 'Bestselling Novel Collection - 3 Books',
    description: 'A curated box set of three bestselling novels from acclaimed authors. Perfect for book lovers and collectors. Beautifully designed covers.',
    price: 999,
    mrp: 1999,
    brand: 'ReadWell',
    sku: 'BK-NV-007',
    barcode: '8901234567896',
    tags: ['books', 'novels', 'reading', 'literature'],
    specifications: [
      { key: 'Format', value: 'Paperback' },
      { key: 'Books', value: '3' },
      { key: 'Language', value: 'English' },
    ],
    inventory: { stock: 40, lowStockThreshold: 5 },
    isFeatured: false,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794', alt: 'Books Collection' },
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', alt: 'Novel' },
    ],
    shippingDetails: { freeShipping: true, weight: 1.5 },
    returnPolicy: '7 days return policy',
  },
  {
    name: 'Educational Building Blocks Set',
    description: '500-piece educational building blocks set that sparks creativity and STEM learning. Non-toxic, BPA-free, and safe for kids. Compatible with major brands.',
    price: 1499,
    mrp: 2999,
    brand: 'KidZone',
    sku: 'TY-BB-008',
    barcode: '8901234567897',
    tags: ['toys', 'blocks', 'educational', 'kids'],
    specifications: [
      { key: 'Pieces', value: '500' },
      { key: 'Material', value: 'ABS Plastic' },
      { key: 'Age Range', value: '6+ years' },
    ],
    inventory: { stock: 25, lowStockThreshold: 5 },
    isFeatured: false,
    status: 'approved',
    isApproved: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b', alt: 'Building Blocks' },
      { url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088', alt: 'Kids playing' },
    ],
    shippingDetails: { freeShipping: true, weight: 2 },
    returnPolicy: '30 days return policy',
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});

    console.log('Data destroyed...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@asli.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create seller user
    const seller = await User.create({
      name: 'Demo Seller',
      email: 'seller@asli.com',
      password: 'seller123',
      role: 'seller',
      sellerProfile: {
        storeName: 'ASLI Store',
        storeDescription: 'The best products at the best prices.',
        gstNumber: 'GSTIN123456',
        approvalStatus: 'approved',
        approved: true,
      },
    });

    // Create buyer user
    const buyer = await User.create({
      name: 'Demo Buyer',
      email: 'buyer@asli.com',
      password: 'buyer123',
      role: 'buyer',
    });

    // Create cart and wishlist for buyer
    await Cart.create({ user: buyer._id, items: [] });
    await Wishlist.create({ user: buyer._id, items: [] });

    console.log('Users created...');

    // Create categories
    const categories = await Category.create(sampleCategories);
    console.log('Categories created...');

    // Create products
    const productsData = sampleProducts.map((product, index) => ({
      ...product,
      seller: seller._id,
      category: categories[index % categories.length]._id,
    }));

    const products = await Product.create(productsData);
    console.log('Products created...');

    console.log('Data imported successfully!');
    console.log('----------------------------------');
    console.log('Admin Login: admin@asli.com / admin123');
    console.log('Seller Login: seller@asli.com / seller123');
    console.log('Buyer Login: buyer@asli.com / buyer123');
    console.log('----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    console.log('Data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}