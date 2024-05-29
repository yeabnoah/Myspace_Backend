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

UserController.patch("/update-profile", async (c: Context) => {
  try {
    const user = c.req.user;

    if (!user) {
      return c.json({ message: "User not authenticated" }, 401);
    }

    const updateData = await c.req.json();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json(updatedUser);
  } catch (error) {
    return c.json(
      { message: `An error occurred: ${(error as Error).message}` },
      500
    );
  }
});

export default UserController;
