// LinkFlair Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var LinkFlairSchema = new Schema(
  {
    content: { type: String, required: true, maxLength: 30 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for linkFlair's URL
LinkFlairSchema.virtual("url").get(function () {
  return "linkFlairs/" + this._id;
});

//Export model
module.exports = mongoose.model("LinkFlair", LinkFlairSchema);
