import { Hono } from "hono";
import { Context } from "hono";
import generateToken from "../middleware/generateToken";
import bcrypt from "bcrypt";
import User from "../model/user";

const actionController = new Hono();

actionController.post("/login", async (c: Context) => {
  try {
    const { username, password } = await c.req.json();

    const user = await User.findOne({ username: username });

    if (!user) {
      return c.json("You are not registered", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = await generateToken(user._id);
      return c.json({ token, message: "You are successfully logged in" }, 200);
    } else {
      return c.json("Incorrect password", 401);
    }
  } catch (error) {
    console.error(error);
    return c.json("An error occurred", 500);
  }
});

actionController.post("/register", async (c: Context) => {
  try {
    const { name, username, password } = await c.req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({
      $or: [{ username: username }],
    });

    if (existingUser) {
      return c.json({ message: "User already exists" }, 400);
    }

    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
      profilePicture:
        "https://d22e6o9mp4t2lx.cloudfront.net/cms/pfp3_d7855f9562.webp",
    });

    await newUser.save();

    const token = await generateToken(newUser._id);

    return c.json({ token, newUser });
  } catch (error) {
    console.error(error);
    return c.json(
      { message: `An error occurred: ${(error as Error).message}` },
      500
    );
  }
});

export default actionController;
