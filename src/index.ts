import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mongoose from "mongoose";
import UserController from "./routes/user";
import themeController from "./routes/theme";
import diaryController from "./routes/diary";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import actionController from "./routes/actions";

const app = new Hono();
app.use("/*", cors());

app.route("/user", UserController);
app.route("/theme", themeController);
app.route("/diary", diaryController);
app.route("/", actionController);

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const port = process.env.PORT;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on port ${port}`);
