const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: false
  },
  date_posted: {
    type: String,
    required: true,
  },
  date_added: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comments',
    },
  ],
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
