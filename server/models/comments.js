// Comment Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    content: { type: String, required: true, maxLength: 500 },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentedDate: { type: Date, required: true, default: Date.now },
    upvotes: { type: Number, required: true, default: 0 },
    downvotes: { type: Number, required: true, default: 0 },
    votedBy: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    votes: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        voteType: {
          type: String,
          enum: ["upvote", "downvote"],
          required: true,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for comment's URL
CommentSchema.virtual("url").get(function () {
  return "comments/" + this._id;
});

//Export model
module.exports = mongoose.model("Comment", CommentSchema);
