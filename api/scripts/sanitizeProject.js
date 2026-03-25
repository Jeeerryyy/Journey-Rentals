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

async function sanitizeProject() {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');

    // 1. Delete all Booking records from MongoDB
    console.log('Deleting all booking records from the database...');
    const deleteResult = await Booking.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} bookings.`);

    // 2. Delete all Booking images exactly inside journey-rentals/bookings via Cloudinary API
    console.log('Clearing all Aadhar and License images from Cloudinary (journey-rentals/bookings/)...');
    try {
      const cloudinaryRes = await cloudinary.api.delete_resources_by_prefix('journey-rentals/bookings/');
      console.log('Cloudinary resources deleted:', Object.keys(cloudinaryRes.deleted || {}).length);
    } catch (cErr) {
      console.error('Cloudinary deletion warning (might already be empty):', cErr.message);
    }

    console.log('Project is totally sanitized! Vehicles and user accounts remain untouched.');
    process.exit(0);
  } catch (e) {
    console.error('Error during sanitization:', e);
    process.exit(1);
  }
}

sanitizeProject();
