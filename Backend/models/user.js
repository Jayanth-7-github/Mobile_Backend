const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  deviceToken: { type: String }, // FCM device token for push notifications
});

module.exports = mongoose.model("User", userSchema);
