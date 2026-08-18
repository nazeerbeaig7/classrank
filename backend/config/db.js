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
  const MAX_RETRIES = isAtlas ? 3 : 1;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: isAtlas ? 15000 : 3000
      });
      const dbType = isAtlas ? 'MongoDB Atlas Cloud' : 'MongoDB Local Server';
      console.log(`[Database] ✅ Connected to ${dbType} at: ${mongoose.connection.host}`);
      console.log(`[Database] Using database: "${mongoose.connection.name}" (DATA IS PERSISTENT)`);
      return; // success — exit the function
    } catch (err) {
      console.warn(`[Database] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`[Database] Retrying in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // All attempts failed — fall back to memory server if allowed
  if (process.env.ALLOW_MEMORY_SERVER !== 'false' && process.env.VERCEL !== '1') {
    try {
      console.warn('[Database] ⚠️  ALL ATLAS CONNECTION ATTEMPTS FAILED!');
      console.warn('[Database] ⚠️  Falling back to MongoDB Memory Server.');
      console.warn('[Database] ⚠️  DATA WILL BE LOST ON SERVER RESTART!');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      await mongoose.connect(memUri);
      console.warn(`[Database] ⚠️  Running on in-memory DB: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start MongoMemoryServer:', memErr.message);
      process.exit(1);
    }
  } else {
    console.error('[Database] Connection failed and fallback disabled. Exiting application.');
    process.exit(1);
  }
};

module.exports = connectDB;
