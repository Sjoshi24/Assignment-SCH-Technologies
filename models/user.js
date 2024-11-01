const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);