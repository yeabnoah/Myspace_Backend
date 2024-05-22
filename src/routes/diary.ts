import { Hono } from "hono";
import Diary from "../model/diary";
import User from "../model/user";

const diaryController = new Hono();

diaryController.get("/", async (c) => {
  try {
    const diaries = await Diary.find();

    return c.json(diaries);
  } catch (err) {
    return c.json({ err: err });
  }
});

diaryController.post("/:id", async (c) => {
  // this block creates a Diary
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const { content, picture, mood } = body;

    const new_Diary = new Diary({
      userId: id,
      content: content,
      picture: picture,
      mood: mood,
    });

    await new_Diary.save();

    await User.updateOne({ _id: id }, { $push: { diaries: new_Diary } })
      .then(() => {
        console.log("added");
      })
      .catch((err) => {
        console.error(err);
      });

    return c.json(new_Diary);
  } catch (err) {
    return c.json({ err: err });
  }
});

diaryController.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const myDiaries = await Diary.find({
      userId: id,
    });

    return c.json(myDiaries);
  } catch (err) {
    return c.json({ err: err });
  }
});

export default diaryController;
