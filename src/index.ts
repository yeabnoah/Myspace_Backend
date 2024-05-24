import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mongoose from "mongoose";
import UserController from "./routes/user";
import themeController from "./routes/theme";
import diaryController from "./routes/diary";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/*", cors());
app.route("/user", UserController);
app.route("/theme", themeController);
app.route("/diary", diaryController);
mongoose
  .connect("mongodb://127.0.0.1/Diary")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const port = 3000;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on port ${port}`);
