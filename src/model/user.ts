import mongoose, { mongo, Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  profilePicture: {
    type: String,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  diaries: [{ type: Schema.Types.ObjectId, ref: "Diary" }],

  theme: {
    type: String,
    default: "primary",
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
