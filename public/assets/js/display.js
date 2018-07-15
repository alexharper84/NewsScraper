$(document).ready(function(){
  $("#scrape-news-button").on('click', function() {
    console.log("scraper clicked!")
    $.ajax({
      type: "GET",
      url: "/scrape",
    }).then(function() {
      location.reload()
    })
  });

  $('.saveComment').on('click', function() {
    var thisId = $(this).attr('data-id');
    if (!$('#commentText-' + thisId).val()) {
      alert('please enter a comment to submit');
    } else {
      $.ajax({
        method: 'POST',
        url: "/articles/" + thisId,
        data: {
          text: $("#commentText-" + thisId).val(),
        },
      }).done(function(data) {
        console.log(data);
        $('#commentText-' + thisId).val('');
        $('.modalComment').modal('hide');
        window.location = '/';
      });
    }
  });

  $('.deleteComment').on('click', function() {
    var commentId = $(this).attr('data-comment-id');
    var articleId = $(this).attr('data-article-id');
    $.ajax({
      method: 'DELETE',
      url: '/article/delete/' + commentId + '/' + articleId,
    }).done(function(data) {
      console.log(data);
      $('.modalComment').modal('hide');
      window.location = '/';
    });
  });
})
