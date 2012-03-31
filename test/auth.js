
var Mouth = require('../mouth'),
  config = require('./config'),
  should = require('should'),
  querystring = require('querystring'),
  util = require('util');


function _verify(m, accessToken, accessTokenSecret, done) {
  m.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', {}, {}, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
    should.not.exist(err);
    res.should.have.status(200);
    res.should.be.json;
//    data = JSON.parse(data);
    done();
  });
}
function _updateAndDelete(m, accessToken, accessTokenSecret, done) {
  var queryParams = {};
  var postParams = {
    'status': '{MOUTH TEST SUITE SLUG}'
  };
  m.shit('POST', 'http://api.twitter.com/1/statuses/update.json', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
    should.not.exist(err);
    res.should.have.status(200);
    res.should.be.json;
    data = JSON.parse(data);
    should.exist(data.id_str);
    var tweetID = data.id_str;
  
    queryParams = {};
    postParams = {};
    var url = 'http://api.twitter.com/1/statuses/destroy/' + tweetID + '.json';
    m.shit('POST', url, queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
      should.not.exist(err);
      res.should.have.status(200);
      res.should.be.json;
      done();
    });
  });
}

describe('Mouth', function () {
  describe('test config', function () {
    should.exist(config.twitter.consumerKey);
    should.exist(config.twitter.consumerSecret);
    should.exist(config.twitter.slave.accessToken);
    should.exist(config.twitter.slave.accessTokenSecret);
    should.exist(config.twitter.indenturedServant.username);
    should.exist(config.twitter.indenturedServant.password);
  });

  describe('Twitter', function () {
    var m = new Mouth();
    var credentials = {
      accessToken: null,
      accessTokenSecret: null
    };

    // slave
    it('should verify slave credentials', function (done) {
      _verify(m, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, done);
    });

    it('should update and delete status with slave credentials', function (done) {
      _updateAndDelete(m, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, done);
    });

    // TODO - update with media and delete



    // xAuth
    it('should create credentials through xAuth and validate', function (done) {
      var queryParams = {};
      var postParams = {
        'x_auth_username': config.twitter.indenturedServant.username,
        'x_auth_password': config.twitter.indenturedServant.password,
        'x_auth_mode': 'client_auth'
      };
      m.shit('POST', 'https://api.twitter.com/oauth/access_token', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, null, null, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);

        var parsedQuery = querystring.parse(data);
        should.exist(parsedQuery.oauth_token);
        should.exist(parsedQuery.oauth_token_secret);

        credentials.accessToken = parsedQuery.oauth_token;
        credentials.accessTokenSecret = parsedQuery.oauth_token_secret;

        done();
      });
    });

    it('should verify xAuth credentials', function (done) {
      _verify(m, credentials.accessToken, credentials.accessTokenSecret, done);
    });

/*
    it('should update and delete status with xAuth credentials', function (done) {
      _updateAndDelete(m, credentials.accessToken, credentials.accessTokenSecret, done);
    });
*/
  });

});
