const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const mongojs = require('mongojs')
const axios = require('axios')
const cheerio = require('cheerio')
const db = require('./models')
const Comments = require('./models/Comments.js');
const Article = require('./models/Article.js');
const PORT = 8080;
const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
const exphbs = require('express-handlebars')
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/appleHearsay'
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {})

app.get("/", (req, res) => {
  Article.find().sort({ _id: -1 })
  .populate('comments')
  .then(function(dbArticle) {
    res.render("index", { dbArticle })
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.get('/scrape', (req, res) => {
  axios.get('https://www.macrumors.com/').then(function(response) {
    var $ = cheerio.load(response.data)
    $('.article').each(function(i, element) {
      var result = {}
      result.title = $(this)
      .children('.preview-text')
      .text()
      result.date_posted = $(this)
      .children('.preview-text')
      .text()
      result.link = $(this)
      .children('.title')
      .children('a')
      .attr('href')
      result.content = $(this)
      .children('.content')
      .text()
      result.link = result.link.replace('//', 'https://')
      if (result.title && result.link && result.content) {
        Article.create({
          title: result.title,
          date_posted: result.date_posted,
          link: result.link,
          content: result.content
        }),
        function(err, inserted) {
          if (err) {
            console.log(err)
          } else {
            console.log(inserted)
          }
        }
      }
    })
    res.send('Scrape Complete.');
    function redirect() {
      window.location = '/';
    }
  });
});

app.get('/articles', (req, res) => {
  Article.find({}).populate('comments')
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});
app.get('/articles/:id', (req, res) => {
  Article.findOne({
    _id: req.params.id
  }, (error, data) => {
    if (error) {
      console.log(error)
      res.send(error)
    } else {
      res.json(data)
    }
  }).populate('comments')
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.post('/articles/:id', function(req, res) {
  var comment_text = req.body
  console.log(comment_text)
  var newComment = new Comments({
    body: req.body.text,
    article: req.params.id,
  });
  console.log(req.body)
  newComment.save(function(error, comment) {
    if (error) {
      console.log(error)
    } else {
      Article.findOneAndUpdate(
        {_id: req.params.id},
        { $push: {comments: comment}
      }).exec(function(err){
        if (err) {
          console.log(err)
          res.send(err)
        } else {
          res.send(comment)
        }
      })
    }
  })
});
app.delete('/article/delete/:note_id/:article_id', function(req, res) {
  Comments.findOneAndRemove({ _id: req.params.note_id }, function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      Article.findOneAndUpdate(
        { _id: req.params.article_id },
        { $pull: { notes: req.params.note_id } }
      )
      .exec(function(err) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.send('Comment Deleted');
        }
      });
    }
  });
});

app.listen(process.env.PORT || PORT, function() {
  console.log('App running on port ' + PORT + '!');
})
