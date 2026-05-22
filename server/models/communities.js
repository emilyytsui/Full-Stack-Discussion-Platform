// Community Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommunitySchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 500 },
    postIDs: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    startDate: { type: Date, required: true, default: Date.now },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for community's memberCount
CommunitySchema.virtual("memberCount").get(function () {
  return Array.isArray(this.members) ? this.members.length : 0;
});

// Virtual for community's URL
CommunitySchema.virtual("url").get(function () {
  return "communities/" + this._id;
});

//Export model
module.exports = mongoose.model("Community", CommunitySchema);
