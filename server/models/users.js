// User Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

var UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => emailRegex.test(v),
        message: "Email format is invalid",
      },
    },
    displayName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    memberSince: { type: Date, required: true, default: Date.now },
    reputation: {
      type: Number,
      required: true,
      default: function () {
        return this.isAdmin ? 1000 : 100;
      },
    },
    isAdmin: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for users's URL
UserSchema.virtual("url").get(function () {
  return "users/" + this._id;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
