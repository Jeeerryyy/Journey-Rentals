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

async function clearDocuments() {
  try {
    console.log('Clearing images from folder: journey-rentals/documents...');
    
    // Note: Cloudinary Admin API delete_resources_by_prefix doesn't delete the folder itself,
    // just the assets inside it.
    const result = await cloudinary.api.delete_resources_by_prefix('journey-rentals/documents/');
    console.log('Deleted resources:', result);
    
    // Optionally delete the empty folder
    try {
      await cloudinary.api.delete_folder('journey-rentals/documents');
      console.log('Deleted folder: journey-rentals/documents');
    } catch(e) {
      console.log('Folder deletion skipped or already empty.');
    }

    console.log('Done cleaning up Aadhar and License images!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to delete:', err);
    process.exit(1);
  }
}

clearDocuments();
