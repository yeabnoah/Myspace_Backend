import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  userImage: String,
  diaryId: {
    type: mongoose.Schema.ObjectId,
    ref: "Diary",
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
