var express = require('express')
var utility = require('utility')
var superagent = require('superagent')
var cheerio =  require('cheerio')
var eventproxy = require('eventproxy')
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
	    var ep = new eventproxy();
	    ep.after('topic_html', topicUrls.slice(0,6).length, function (topics) {
	      // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair
	      // 开始行动
	      topics.map(function (topicPair) {
	        // 接下来都是 jquery 的用法了
	        var topicUrlObj = topicPair[0];
	        if(topicUrlObj.title){
	        	globalTopics.push(topicUrlObj)
	        }        
	      });
	      count++
	      render(res)
	    });
	    topicUrls.slice(0,6).forEach(function (topicUrl) {
	      superagent.get(topicUrl)
	        .end(function (err, res) {
	        	var $ = cheerio.load(res.text);
	        	var title = $('.topic_full_title').text().trim()
		        var comment = $('.reply_content').eq(0).text().trim()
		        var commentAuthorUrl = $('.author_content').eq(0).find('.user_avatar').attr('href')
		        if(commentAuthorUrl){
					superagent.get(url.resolve(cnodeUrl,commentAuthorUrl))
						.end(function(aerr,ares){
							var $A = cheerio.load(ares.text);
							var score = $A('.user_profile .big').text()
							console.log("author:",url.resolve(cnodeUrl,commentAuthorUrl),score)
							//为什么总有一些积分取不到?????(因为一次取太多了,需要解决高并发的问题)
		            		ep.emit('topic_html', [{
		            			title: title,
						        href: topicUrl,
						        comment: comment,
						        author: commentAuthorUrl.replace('/user/',''),
						        authorUrl: url.resolve(cnodeUrl,commentAuthorUrl),
						        score:score
		            		}]);
						})
		        }else{
		        	ep.emit('topic_html', [{
            			title: title,
				        href: topicUrl,
				        comment: comment,
				        author: '',
				        score:''
            		}]);
		        }
	        });
	    });
	    // authorUrls.forEach(function (authorUrl){
	    // 	superagent.get(authorUrl)
	    //     .end(function (err, res) {
	    //       ep.emit('topic_author', [authorUrl, res.text]);
	    //     });
	    // })
		function render(res){
			var str = '<ol>'
			//if(count == 2){
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
				res.send(str)
			//}
		}
	  });
})
app.listen(3000, function () {
  console.log('app is listening at port 3000');
});