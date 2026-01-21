"use node";
import { MongoClient } from "mongodb";

/**
 * Singleton MongoDB client instance.
 * Ensures connection pooling by reusing the same client across requests.
 */
let mongoClient: MongoClient | null = null;

/**
 * Get or create a MongoDB client instance.
 *
 * This function implements the singleton pattern to ensure connection pooling.
 * The same MongoClient instance is returned on subsequent calls, which allows
 * MongoDB to efficiently manage connection pools internally.
 *
 * @returns {Promise<MongoClient>} The MongoDB client instance
 * @throws {Error} If MONGODB_URI environment variable is not configured
 * @throws {Error} If connection to MongoDB fails
 *
 * @example
 * ```typescript
 * const client = await getMongoClient();
 * const db = client.db("my-database");
 * const collection = db.collection("my-collection");
 * ```
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not configured");
    }

    console.log("Creating new MongoDB client connection...");
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    console.log("MongoDB client connected successfully");
  }
  return mongoClient;
}

/**
 * Close the MongoDB client connection and reset the singleton state.
 *
 * This function should be called when shutting down the application or
 * when you need to force a new connection to be created.
 *
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * await closeMongoClient();
 * ```
 */
export async function closeMongoClient(): Promise<void> {
  if (mongoClient) {
    console.log("Closing MongoDB client connection...");
    await mongoClient.close();
    mongoClient = null;
    console.log("MongoDB client connection closed");
  }
}

