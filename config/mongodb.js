import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () =>
    console.log("MongoDB is connected")
  );
  await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });
};

export default connectDB;
