require("dotenv").config();
import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import User from "../model/user";

// Extend the Hono request type to include the `user` property
declare module "hono" {
  interface HonoRequest {
    user?: any;
  }
}

const authenticator = async (c: Context, next: Next) => {
  const token = c.req.header("authorization");
  const secret = "mySecretKey";

  if (!token) {
    return c.json({ message: "No token provided" }, 401);
  }

  try {
    const decodedPayload = await verify(token, secret);
    const userId = decodedPayload.userId;

    const user = await User.findById(userId);

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    c.req.user = user; // Attach user to request
    await next();
  } catch (err) {
    console.error(err);
    return c.json({ message: "Invalid token" }, 401);
  }
};

export default authenticator;
