const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDB, disconnectDB, clearDB } = require("../config/database");

let mongoServer;

const setupTestDatabase = () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test_jwt_secret";
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await disconnectDB();

    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = setupTestDatabase;
