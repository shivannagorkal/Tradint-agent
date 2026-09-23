import mongoose from "mongoose";
import { env } from "../config/env";

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection warning (running in fallback/standalone mode if offline):`, error);
    return mongoose;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
