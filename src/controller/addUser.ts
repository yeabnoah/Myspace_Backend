import { Hono } from "hono";

type Body = {
  name: string;
  age: number;
};

const AddUser = async (c) => {
  const newUser = await c.req.parseBody<Body>();
};
