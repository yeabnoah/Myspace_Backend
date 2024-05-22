import mongoose, { model, mongo } from "mongoose";

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  primary: {
    type: String,
  },
  secondary: {
    type: String,
  },
});

const Theme = mongoose.model("Theme", themeSchema);
export default Theme;
