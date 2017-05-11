// file: test/fibonaqi.test.js
var app = require('../fibonaqi');
var supertest = require('supertest')
var request = supertest(app)
var should = require('should');

describe('test/fibonaqi.test.js', function () {
  it('should equal 0 when n === 0', function () {
    testFib(0,'0',done)
  });

  it('should equal 1 when n === 1', function (done) {
    testFib(1,'1',done)
  });

  it('should throw when n > 10', function (done) {
    testFib(11,'n should <= 10',done);
  });

  it('should throw when n < 0', function (done) {
    testFib(-1,'n should >= 0',done);
  });

  it('should throw when n isnt Number', function (done) {
    testFib('test','n should be a Number',done);
  });
  it('should equal 55 when n === 10', function (done) {
    testFib(10,'55',done)
  });
  // 单独测试一下返回码 500
  it('should status 500 when error', function (done) {
    request.get('/fib')
      .query({n: 100})
      .end(function (err, res) {
        res.status.should.equal(500);
        done(err);
      });
  });
  function testFib(n,expect,done){
    request.get('/fib')
    .query({n:n})
    .end(function(err,res){
      shoule.not.exist(err)
      res.text.should.equal(expect)
      done(err)
    })
  }

});