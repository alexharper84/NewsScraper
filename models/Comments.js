const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var CommentSchema = new Schema({
  body: String,
  date_added: {
    type: Date,
    default: Date.now
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }
});

var Comments = mongoose.model("Comments", CommentSchema);

module.exports = Comments;
