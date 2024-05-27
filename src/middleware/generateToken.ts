import { sign } from "hono/jwt";
import mongoose from "mongoose";

const generateToken = async (
  userID: mongoose.Types.ObjectId
): Promise<string> => {
  const payload = {
    userId: userID.toString(), // Ensure userID is a string
    exp: Math.floor(Date.now() / 1000) + 60 * 10080, // week to expire
  };

  const secret = "mySecretKey"; // Use environment variable for secret key
  const token = await sign(payload, secret);
  return token;
};

export default generateToken;
