const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { cloudinary } = require('./config/cloudinary');

async function runTest() {
  console.log("--- Cloudinary Connection Test ---");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    // Test simple API call to check credentials
    const result = await cloudinary.api.ping();
    console.log("✅ API Connection status:", result.status); // should return 'ok'

    // Test a dummy upload (a small transparent pixel)
    console.log("Attempting a test upload...");
    const uploadResult = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", {
      folder: "connection_test"
    });
    console.log("✅ Upload successful!");
    console.log("Test Image URL:", uploadResult.secure_url);
  } catch (error) {
    console.error("❌ Cloudinary Test failed!");
    console.error("Error details:", error.message);
  }
}

runTest();