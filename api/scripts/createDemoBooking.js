import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { connectDB } from '../_lib/mongodb.js';
import Booking from '../_lib/models/Booking.js';
import User from '../_lib/models/User.js';
import Vehicle from '../_lib/models/Vehicle.js';

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Find any user and any vehicle
    const user = await User.findOne({ role: 'customer' }) || await User.findOne();
    const vehicle = await Vehicle.findOne();

    if (!user || !vehicle) {
      console.log('No user or vehicle found. Aborting.');
      process.exit(1);
    }

    // Read the user-provided image
    const imgPath = 'C:\\Users\\parak\\.gemini\\antigravity\\brain\\tempmediaStorage\\media__1774481781130.jpg';
    let base64Str = '';
    
    if (fs.existsSync(imgPath)) {
      base64Str = 'data:image/jpeg;base64,' + fs.readFileSync(imgPath).toString('base64');
    } else {
      console.log('Image not found locally, fetching dummy image from web...');
      const response = await fetch('https://res.cloudinary.com/demo/image/upload/sample.jpg');
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Str = 'data:image/jpeg;base64,' + buffer.toString('base64');
    }
    
    console.log('Uploading images to new date folder structure...');
    const today = new Date().toISOString().split('T')[0];
    
    // Upload standard base64 or URL
    const uploadRes1 = await cloudinary.uploader.upload(base64Str, { 
      folder: `journey-rentals/bookings/${today}`, 
      public_id: `demo_aadhar_${Date.now()}` 
    });
    
    const uploadRes2 = await cloudinary.uploader.upload(base64Str, { 
      folder: `journey-rentals/bookings/${today}`, 
      public_id: `demo_license_${Date.now()}` 
    });

    console.log('Creating demo booking...');
    const b = new Booking({
      userId: user._id,
      vehicleId: vehicle._id,
      bookingType: 'car',
      pickupDate: new Date(),
      returnDate: new Date(Date.now() + 86400000), // +1 day
      totalDays: 1,
      totalPrice: 1500,
      advancePaid: 500,
      balanceDue: 1000,
      referenceId: 'DEMO-' + Math.floor(Math.random()*10000),
      status: 'confirmed',
      documents: {
        aadharUrl: uploadRes1.secure_url,
        licenseUrl: uploadRes2.secure_url,
      },
      userSnapshot: { name: 'Demo User', phone: '9999999999', email: 'demo@demo.com' },
      vehicleSnapshot: { brand: vehicle.brand || 'Demo', model: vehicle.model || 'Car', type: vehicle.type || 'Hatchback' }
    });
    
    await b.save();
    console.log('Booking created successfully! Reference ID:', b.referenceId);
    console.log('Aadhar URL:', uploadRes1.secure_url);
    console.log('License URL:', uploadRes2.secure_url);
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

run();
