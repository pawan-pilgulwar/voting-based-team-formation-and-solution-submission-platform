import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Connected to database: ${DB_NAME}\nDB host: ${mongoose.connection.host}` );
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export default connectDB;