  const { connect, connection } = require("mongoose");
  const config = require("../config.json");

  async function connectToDb() {
  try {
    const db = connection;

    db.on("error", (err) => console.error("[Database] Connection error:", err));
    db.on("open", () => console.log("[Database] MongoDB connection opened successfully."));
    db.on("disconnected", () => {
      console.warn("[Database] MongoDB disconnected. Retrying in 5s...");
      setTimeout(connectToDb, 5000); // Retry after 5s
    });

    db.on("reconnected", () => console.log("[Database] MongoDB connection reestablished successfully."));

    if (!config.mongoURL) throw new Error("[Database] MongoDB config field is not defined");

    await connect(config.mongoURL, {
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });
    
    process.on("SIGINT", async () => {
      await connection.close();
      console.warn("[Database] Connection closed due to application termination");
      process.exit(0);
    });
  } catch (error) {
      console.error("[Database] Error with database:", error);
  }
}

  module.exports = { connectToDb };