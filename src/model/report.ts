import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema({
  name: {
    type: String,
    enum: [
      "violence",
      "child_Abuse",
      "pornography",
      "Illegal_Drugs",
      "copyRight",
    ],
    required: true,
  },
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

const Report = mongoose.model("Report", reportSchema);

export default Report;
