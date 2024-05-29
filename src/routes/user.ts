import { Hono } from "hono";
import { Context } from "hono";
import User from "../model/user";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generateToken from "../middleware/generateToken";
import authenticator from "../middleware/authenticate";

const UserController = new Hono();

UserController.use(authenticator);

UserController.get("/", async (c: Context) => {
  try {
    const users = await User.find().select("-password");
    return c.json(users);
  } catch (error) {
    return c.json(
      { message: `An error occurred: ${(error as Error).message}` },
      500
    );
  }
});

UserController.get("/:id", async (c: Context) => {
  try {
    const requestingUserId = c.req.user._id;

    const id = c.req.param("id");

    const userById = await User.findOne({ _id: id }).populate("diaries");

    if (!userById) {
      return c.json({ message: "User not found" }, 404);
    }

    if (id === requestingUserId) {
      return c.json(userById);
    } else {
      const userWithoutPassword = { ...userById.toJSON(), password: undefined };
      return c.json(userWithoutPassword);
    }
  } catch (error) {
    return c.json(
      { message: `An error occurred: ${(error as Error).message}` },
      500
    );
  }
});

UserController.get("/whoami/", async (c: Context) => {
  try {
    const user = await c.req.user;

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const myDetails = await User.findOne({
      _id: user.id,
    });

    return c.json(myDetails);
  } catch (error) {
    return c.json(
      { message: `An error occurred: ${(error as Error).message}` },
      500
    );
  }
});

export default UserController;
