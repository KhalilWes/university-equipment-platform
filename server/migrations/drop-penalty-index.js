const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function dropPenaltyIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 90000,
      socketTimeoutMS: 90000,
      connectTimeoutMS: 90000,
      family: 4
    });

    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('penalties');
    
    // List all indexes
    const indexes = await collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Drop the unique index on reservationId if it exists
    try {
      await collection.dropIndex('reservationId_1');
      console.log('✅ Successfully dropped reservationId_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist');
      } else {
        console.error('Error dropping index:', error);
      }
    }

    // Verify indexes after dropping
    const indexesAfter = await collection.getIndexes();
    console.log('Indexes after migration:', Object.keys(indexesAfter));

    await mongoose.disconnect();
    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

dropPenaltyIndex();
