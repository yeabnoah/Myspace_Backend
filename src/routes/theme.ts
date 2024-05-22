import { Hono } from "hono";
import Theme from "../model/theme";

const themeController = new Hono();

themeController.get("/", async (c) => {
  try {
    const themes = await Theme.find();
    return c.json(themes);
  } catch (err) {
    return c.json({
      error: err,
    });
  }
});

themeController.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const newTheme = new Theme(body);
    await newTheme.save();
    return c.json(newTheme);
  } catch (err) {
    return c.json({
      error: err,
    });
  }
});

themeController.get("/:id", async (c) => {
  try {
    const id = await c.req.param("id");
    const themeById = await Theme.findOne({
      _id: id,
    });
    return c.json(themeById);
  } catch (err) {
    return c.json({
      error: err,
    });
  }
});

themeController.delete("/:id", async (c) => {
  try {
    const id = await c.req.param("id");

    await Theme.deleteOne({
      _id: id,
    });

    return c.json({
      messg: "user Deleted",
    });
  } catch (err) {
    return c.json({
      error: err,
    });
  }
});

export default themeController;
