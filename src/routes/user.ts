import { Hono } from "hono";
import User from "../model/user";
import mongoose from "mongoose";
const UserController = new Hono();

UserController.get("/", async (c) => {
  const users = await User.find();
  return c.json(users);
});

UserController.post("/", async (c) => {
  const body = await c.req.json();
  const new_user = new User(body);

  await new_user.save();
  return c.json(body);
});

UserController.get("/:id", async (c) => {
  const id = await c.req.param("id");

  const usersById = await User.findOne({ _id: id }).populate("diaries");

  return c.json(usersById);
});

export default UserController;
