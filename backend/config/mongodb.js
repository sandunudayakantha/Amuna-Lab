import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("Database Connected"));
    mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
    mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/medicallab`, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;