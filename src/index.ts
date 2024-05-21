import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mongoose, { Mongoose } from "mongoose";

const app = new Hono();
mongoose.connect("mongodb://127.0.0.1/test").then(() => {
  console.log("Connected to MongoDB");
});

type body = {
  name: string;
  age: number;
};

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/", (c) => {
  c.body = {
    name: "yeabsra",
    age: "test",
  };
  return c.json(c.body);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
