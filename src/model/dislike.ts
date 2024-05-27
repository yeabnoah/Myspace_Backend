import mongoose, { Schema } from "mongoose";

const dislikeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  diaryId: {
    type: Schema.Types.ObjectId,
    ref: "Diary",
    required: true,
  },
});

const Dislike = mongoose.model("Dislike", dislikeSchema);

export default Dislike;
