var express = require('express')
var utility = require('utility')
var superagent = require('superagent')
var cheerio =  require('cheerio')
var eventproxy = require('eventproxy')
var async = require('async')
var url = require('url')
var cnodeUrl = 'https://cnodejs.org/'
var app = express()
app.get('/', function (req, res) {
	var q = req.query.q || ''
	var md5Value = utility.md5(q)
  	res.send(md5Value + Math.random());
});
app.get('/fetch',function(req,res){
	superagent.get('https://cnodejs.org/')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element);
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href')
        });
      });
      res.send(items);
    });
})

app.get('/topic',function(req,res){
	superagent.get(cnodeUrl)
	  .end(function (err, sres) {
	    if (err) {
	      return console.error(err);
	    }
	    var topicUrls = [];
	    var authorUrls = []
	    var globalTopics = []
	    var globalAuthors = []
	    var $ = cheerio.load(sres.text);
	    var wrapper = $('#topic_list')
	    var count = 0
	    // 获取首页所有的链接
	    $('#topic_list .topic_title').each(function (idx, element) {
	      var $element = $(element);
	      var parent = $element.closest('.cell')
	      var href = $element.attr('href')
	      if(href){
			href = url.resolve(cnodeUrl, href)
	      	topicUrls.push(href);
	      }
	    });
	    var resultStr = ''
		async.mapLimit(topicUrls, 5, function (topicUrl, callback) {
  	      superagent.get(topicUrl)
  	        .end(function (err, innerres) {
  	        	var $ = cheerio.load(innerres.text);
  	        	var title = $('.topic_full_title').text().trim()
  		        var comment = $('.reply_content').eq(0).text().trim()
  		        var commentAuthorUrl = $('.author_content').eq(0).find('.user_avatar').attr('href')
  		        if(commentAuthorUrl){
  					superagent.get(url.resolve(cnodeUrl,commentAuthorUrl))
  						.end(function(aerr,ares){
  							var $A = cheerio.load(ares.text);
  							var score = $A('.user_profile .big').text()
  							console.log("author:",topicUrl,url.resolve(cnodeUrl,commentAuthorUrl),score)
  							globalTopics.push({
  								title: title,
  						        href: topicUrl,
  						        comment: comment,
  						        author: commentAuthorUrl.replace('/user/',''),
  						        authorUrl: url.resolve(cnodeUrl,commentAuthorUrl),
  						        score:score
  							})
  						})
  		        }else{
  		        	globalTopics.push({
						title: title,
				        href: topicUrl,
				        comment: comment,
				        author: '',
				        authorUrl: '',
				        score:''
					})
  		        }
  	        });
			render(res)				
		}, function (err, result) {
		  console.log('final:');
		  console.log(result);
		});

		function render(res){
			var str = '<ol>'
			if(globalTopics.length == topicUrls.length){
				var result = globalTopics.map(function(v){
					str += '<li style="padding:5px;"><a href="' + v.href + '">' + v.title + '</a><br/>'
					if(v.comment){
						str += '<a href="' + v.authorUrl + '">' + v.author + '</a>'
						if(v.score){
							str += '(' + v.score + '积分)' 
						}
						str += '评论:' + v.comment
					}
					str += '</li>'
					return v

				})
				str += "</ol>"
				//console.log(str)
				res.send(str)//这一句没有发给客户端,什么原因呢?
			}
		}
	  });
})
app.listen(3000, function () {
  console.log('app is listening at port 3000');
});