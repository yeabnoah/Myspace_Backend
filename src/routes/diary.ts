import { Hono, Context } from "hono";
import Diary from "../model/diary";
import User from "../model/user";
import { jwt } from "hono/jwt";
import authenticator from "../middleware/authenticate";
import Comment from "../model/comment";
import Like from "../model/like";
import Dislike from "../model/dislike";
import Report from "../model/report";

const diaryController = new Hono();

diaryController.use(authenticator);

diaryController.get("/", async (c) => {
  try {
    const user = await c.req.user;
    const diaries = await Diary.find({
      $and: [{ isPublic: true }, { userId: user._id }, { status: true }],
    });

    return c.json(diaries);
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.post("/", async (c: Context) => {
  try {
    const user = c.req.user;
    const body = await c.req.json();

    const { content, picture, mood, theme, isPublic, date } = body;

    const newDiary = new Diary({
      userId: user._id,
      content,
      picture,
      mood,
      theme,
      isPublic,
      date,
    });

    await newDiary.save();

    await User.updateOne(
      { _id: user._id },
      { $push: { diaries: newDiary._id } }
    );

    return c.json(newDiary);
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await c.req.user;

    const myDiaries = await Diary.find({
      userId: id,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    });

    return c.json(myDiaries);
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await c.req.user;

    const diary = await Diary.findOne({ _id: id, userId: user._id });
    if (!diary) {
      return c.json({
        error:
          "Diary entry not found or you do not have permission to delete it",
      });
    }

    await diary.deleteOne();

    await User.updateOne({ _id: user._id }, { $pull: { diaries: id } });

    return c.json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" });
  }
});

diaryController.patch("/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const updated = await Diary.updateOne({ _id: id }, { $set: body });

    return c.json(updated);
  } catch (err) {
    return c.json({ err: "Internal server error" });
  }
});

// =============================== this is a comments Part

diaryController.post("/comment/:diaryId", async (c) => {
  try {
    const user = await c.req.user;
    const diaryId = c.req.param("diaryId");
    const body = await c.req.json();

    const diaryQuery = {
      _id: diaryId,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    };

    const newComment = new Comment({
      content: body.content,
      userId: user._id,
      diaryId: diaryId,
    });

    const savedComment = await newComment.save();

    const updatedDiary = await Diary.findOneAndUpdate(
      diaryQuery,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    if (!updatedDiary) {
      return c.json({ err: "Diary not found or you don't have access" });
    }

    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.get("/comments/:diaryId", async (c) => {
  try {
    const user = await c.req.user;
    const diaryId = c.req.param("diaryId");

    const diaryQuery = {
      _id: diaryId,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    };

    const diary = await Diary.findOne(diaryQuery).populate("comments");

    if (!diary) {
      return c.json({ err: "Diary not found or you don't have access" });
    }

    return c.json({ comments: diary.comments });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.get("/comments/detail/:commentId", async (c) => {
  try {
    const user = await c.req.user;
    const commentId = c.req.param("commentId");

    const comment = await Comment.findOne({
      _id: commentId,
      userId: user._id,
    });

    if (!comment) {
      return c.json({ err: "Comment not found or you don't have access" });
    }

    return c.json(comment);
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.patch("/comments/:commentId", async (c) => {
  try {
    const user = await c.req.user;
    const commentId = c.req.param("commentId");
    const body = await c.req.json();

    const updatedComment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        userId: user._id,
      },
      {
        $set: body,
      },
      { new: true }
    );

    if (!updatedComment) {
      return c.json({ err: "Comment not found or you don't have access" });
    }

    return c.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

diaryController.delete("/comments/:commentId", async (c) => {
  try {
    const user = await c.req.user;
    const commentId = c.req.param("commentId");

    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      userId: user._id,
    });

    if (!deletedComment) {
      return c.json({ err: "Comment not found or you don't have access" });
    }

    return c.json({
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

// this one right here is for liking
diaryController.post("/like/:diaryId", async (c) => {
  try {
    const user = await c.req.user;
    const diaryId = c.req.param("diaryId");

    const diaryQuery = {
      _id: diaryId,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    };

    const existingDislike = await Dislike.findOneAndDelete({
      diaryId: diaryId,
      userId: user._id,
    });

    if (existingDislike) {
      await Diary.findOneAndUpdate(
        { _id: diaryId },
        { $pull: { dislikes: existingDislike._id } }
      );
    }

    const existingLike = await Like.findOneAndDelete({
      diaryId: diaryId,
      userId: user._id,
    });

    if (existingLike) {
      await Diary.findOneAndUpdate(
        { _id: diaryId },
        { $pull: { likes: existingLike._id } }
      );
      return c.json({ success: true, message: "Like removed" });
    }

    const diary = await Diary.findOne(diaryQuery);

    if (!diary) {
      return c.json({ err: "Diary not found or you don't have access" });
    }

    const newLike = new Like({
      userId: user._id,
      diaryId: diaryId,
    });

    const savedLike = await newLike.save();

    await Diary.findOneAndUpdate(
      { _id: diaryId },
      { $push: { likes: savedLike._id } }
    );

    return c.json({ success: true, message: "Like added" });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

// this one right here is for Disliking
diaryController.post("/dislike/:diaryId", async (c) => {
  try {
    const user = await c.req.user;
    const diaryId = c.req.param("diaryId");

    const diaryQuery = {
      _id: diaryId,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    };

    const existingLike = await Like.findOneAndDelete({
      diaryId: diaryId,
      userId: user._id,
    });

    if (existingLike) {
      await Diary.findOneAndUpdate(
        { _id: diaryId },
        { $pull: { likes: existingLike._id } }
      );
    }

    const existingDislike = await Dislike.findOneAndDelete({
      diaryId: diaryId,
      userId: user._id,
    });

    if (existingDislike) {
      await Diary.findOneAndUpdate(
        { _id: diaryId },
        { $pull: { dislikes: existingDislike._id } }
      );
      return c.json({ success: true, message: "Dislike removed" });
    }

    const diary = await Diary.findOne(diaryQuery);

    if (!diary) {
      return c.json({ err: "Diary not found or you don't have access" });
    }

    const newDislike = new Dislike({
      userId: user._id,
      diaryId: diaryId,
    });

    const savedDislike = await newDislike.save();

    await Diary.findOneAndUpdate(
      { _id: diaryId },
      { $push: { dislikes: savedDislike._id } }
    );

    return c.json({ success: true, message: "Dislike added" });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

// this is for Reporting Post

diaryController.post("/report/:diaryId", async (c) => {
  try {
    const user = await c.req.user;
    const diaryId = c.req.param("diaryId");
    const body = await c.req.json();

    const reportTypes = [
      "violence",
      "child_Abuse",
      "pornography",
      "Illegal_Drugs",
      "copyRight",
    ];

    if (!reportTypes.includes(body.name)) {
      return c.json({ err: "Invalid report type" });
    }

    const diaryQuery = {
      _id: diaryId,
      $or: [{ isPublic: true }, { userId: user._id }, { status: true }],
    };

    const existingReport = await Report.findOne({
      diaryId: diaryId,
      userId: user._id,
      name: body.name,
    });

    if (existingReport) {
      return c.json({
        err: "You have already reported this diary for this reason",
      });
    }

    const newReport = new Report({
      name: body.name,
      userId: user._id,
      diaryId: diaryId,
    });

    const savedReport = await newReport.save();

    const updatedDiary = await Diary.findOneAndUpdate(
      diaryQuery,
      { $push: { reports: savedReport._id } },
      { new: true }
    );

    if (updatedDiary && updatedDiary.reports.length >= 10) {
      updatedDiary.status = false;
      await updatedDiary.save();
    }

    return c.json({ success: true, message: "Report added" });
  } catch (err) {
    console.error(err);
    return c.json({ err: "Internal server error" });
  }
});

export default diaryController;
