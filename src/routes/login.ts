import { jwt } from "hono/jwt";
import { Hono } from "hono";
import User from "../model/user";

const actions = new Hono();

actions.get("/", async (c) => {
  return c.json({ messg: "test" });
});

export default actions;
