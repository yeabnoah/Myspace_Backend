import mongoose, { Schema } from "mongoose";

const diarySchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
  },
  picture: {
    type: Array,
  },
  mood: {
    type: String,
  },
  theme: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: false,
  },
  date: {
    type: String,
  },

  status: {
    type: Boolean,
    default: true,
  },
  reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "Dislike" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

const Diary = mongoose.model("Diary", diarySchema);

export default Diary;
