const mongoose = require("mongoose");

const connectDB = async (mongoUri = process.env.MONGO_URI) => {
  await mongoose.connect(mongoUri);
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

const clearDB = async () => {
  const { collections } = mongoose.connection;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB,
};
