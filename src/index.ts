import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mongoose from "mongoose";
import UserController from "./routes/user";
import themeController from "./routes/theme";
import diaryController from "./routes/diary";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import actions from "./routes/login";

const app = new Hono();
app.use("/*", cors());

app.use(
  "/auth/*",
  jwt({
    secret: "it-is-very-secret",
  })
);

app.route("/user", UserController);
app.route("/theme", themeController);
app.route("/diary", diaryController);
app.route("/", actions);
// this is gonna work ... i believe it will
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
