const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classrank';
  
  // Check if placeholder <db_password> or <password> is still in URI
  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    console.warn('--------------------------------------------------------------------------------');
    console.warn('⚠️ WARNING: Your MONGODB_URI still contains "<db_password>" placeholder!');
    console.warn('👉 Please replace <db_password> in backend/.env with your actual Atlas password.');
    console.warn('--------------------------------------------------------------------------------');

    if (process.env.VERCEL === '1') {
      console.error('[Database] Cannot connect to MongoDB Atlas with unreplaced password placeholder.');
      process.exit(1);
    }
    
    // Switch to local MongoDB URI for local development fallback
    uri = 'mongodb://127.0.0.1:27017/classrank';
  }

  const isAtlas = uri.startsWith('mongodb+srv://');

  try {
    // Attempt MongoDB connection (Atlas Cloud or Local Server)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isAtlas ? 10000 : 3000
    });
    console.log(`[Database] Connected to ${isAtlas ? 'MongoDB Atlas Cloud' : 'MongoDB Local Server'} at: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${uri}): ${err.message}`);
    
    // Fall back to memory server if local MongoDB or Atlas is not available
    if (process.env.ALLOW_MEMORY_SERVER !== 'false' && process.env.VERCEL !== '1') {
      try {
        console.log('[Database] Initializing MongoDB Memory Server fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        
        await mongoose.connect(memUri);
        console.log(`[Database] Connected to MongoDB Memory Server at: ${memUri}`);
      } catch (memErr) {
        console.error('[Database] Failed to start MongoMemoryServer:', memErr.message);
        process.exit(1);
      }
    } else {
      console.error('[Database] Connection failed and fallback disabled. Exiting application.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
