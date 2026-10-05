const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Garment = require('./models/Garment');
const Measurement = require('./models/Measurement');
const SavedLook = require('./models/SavedLook');
const TryOnEvent = require('./models/TryOnEvent');
const Notification = require('./models/Notification');
const env = require('./config/env');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(env.mongodbUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Garment.deleteMany({});
    await Measurement.deleteMany({});
    await SavedLook.deleteMany({});
    await TryOnEvent.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // Create 1 Retailer
    const retailer = await User.create({
      name: 'Zara Official Retailer',
      email: 'retailer@fitmirror.com',
      password: 'password123',
      role: 'retailer',
    });
    console.log(`[Seed] Retailer created: ${retailer.email}`);

    // Create 1 User
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'user@fitmirror.com',
      password: 'password123',
      role: 'user',
      photoUrl: '/uploads/users/sample-user.svg',
    });
    console.log(`[Seed] User created: ${user.email}`);

    // Create Body Measurements for User
    await Measurement.create({
      user: user._id,
      height: 178,
      weight: 72,
      chest: 98,
      waist: 84,
      hips: 96,
      shoulder: 45,
      preferredFit: 'regular',
    });
    console.log('[Seed] Measurements created for user.');

    // Specific garment metadata mapping
    const metadata = {
      'tshirt-white.png': { title: 'Classic White Crew T-Shirt', category: 'T-Shirt', price: 24.99 },
      'tshirt-black.png': { title: 'Essential Black Cotton T-Shirt', category: 'T-Shirt', price: 25.99 },
      'tshirt-red.png': { title: 'Vibrant Red Casual T-Shirt', category: 'T-Shirt', price: 22.99 },
      'shirt-black.png': { title: 'Tailored Black Button-Down Shirt', category: 'Shirt', price: 49.99 },
      'jeans-blue.png': { title: 'Light Wash Straight Fit Jeans', category: 'Jeans', price: 69.99 },
      'jeans-dark.png': { title: 'Dark Indigo Denim Jeans', category: 'Jeans', price: 79.99 },
    };

    const garmentsDir = path.join(__dirname, '../uploads/garments');
    const imageFiles = fs.existsSync(garmentsDir)
      ? fs.readdirSync(garmentsDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.startsWith('.'))
      : [];

    const sampleGarments = imageFiles.map((filename) => {
      const meta = metadata[filename] || {};
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const formattedTitle = meta.title || nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      let category = meta.category;
      if (!category) {
        if (/tshirt/i.test(filename)) category = 'T-Shirt';
        else if (/shirt/i.test(filename)) category = 'Shirt';
        else if (/jeans/i.test(filename)) category = 'Jeans';
        else category = 'T-Shirt';
      }

      return {
        title: formattedTitle,
        description: `${formattedTitle} - authentic high-quality garment.`,
        category: category,
        price: meta.price || 34.99,
        size: 'M',
        availableSizes: ['S', 'M', 'L', 'XL'],
        imageUrl: `/uploads/garments/${filename}`,
        purchaseUrl: `https://example.com/buy/${nameWithoutExt}`,
        retailer: retailer._id,
      };
    });

    const garments = await Garment.insertMany(sampleGarments);
    console.log(`[Seed] ${garments.length} garments created.`);

    // Create 1 Sample Saved Look
    if (garments.length > 0) {
      const savedLook = await SavedLook.create({
        user: user._id,
        name: 'Classic Casual Outfit',
        garments: garments.slice(0, 2).map(g => g._id),
        previewUrl: garments[0].imageUrl,
        isPublic: true,
        shareToken: 'casualoutfitshare',
      });
      console.log(`[Seed] Sample Saved Look created: "${savedLook.name}"`);

      // Create Sample TryOnEvents for Analytics
      const tryOnEvents = garments.flatMap(g => [
        { garment: g._id, user: user._id, retailer: retailer._id, eventType: 'try_on' },
        { garment: g._id, user: user._id, retailer: retailer._id, eventType: 'purchase_click' },
      ]);
      await TryOnEvent.insertMany(tryOnEvents);
      console.log('[Seed] Analytics events seeded.');
    }

    // Create Sample Notification
    await Notification.create({
      recipient: user._id,
      title: 'Welcome to FitMirror',
      message: 'Explore our latest collection of T-Shirts, Shirts, and Jeans with virtual fitting!',
      read: false,
    });
    console.log('[Seed] Sample Notification seeded.');

    console.log('\n===========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('===========================================');
    console.log(`Seeded ${garments.length} real PNG garments.`);
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
