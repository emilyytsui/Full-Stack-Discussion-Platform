// Post Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 100 },
    content: { type: String, required: true },
    linkFlairID: { type: Schema.Types.ObjectId, ref: "LinkFlair" },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postedDate: { type: Date, required: true, default: Date.now },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    views: { type: Number, required: true, default: 0 },
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

// Virtual for post's URL
PostSchema.virtual("url").get(function () {
  return "posts/" + this._id;
});

//Export model
module.exports = mongoose.model("Post", PostSchema);
