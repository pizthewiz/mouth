
var mouth = require('../mouth'),
  config = require('./config'),
  should = require('should'),
  querystring = require('querystring'),
  util = require('util');

function _verify(accessToken, accessTokenSecret, done) {
  mouth.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', {}, {}, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
    should.not.exist(err);
    res.should.have.status(200);
    res.should.be.json;
//    data = JSON.parse(data);
    done();
  });
}
function _delete(tweetID, accessToken, accessTokenSecret, done) {
    var queryParams = {};
    var postParams = {};
    var url = 'http://api.twitter.com/1/statuses/destroy/' + tweetID + '.json';
    mouth.shit('POST', url, queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
      should.not.exist(err);
      res.should.have.status(200);
      res.should.be.json;
      done();
    });
}
function _updateAndDelete(accessToken, accessTokenSecret, done) {
  var queryParams = {};
  var postParams = {
    'status': '{MOUTH TEST SUITE SLUG}'
  };
  mouth.shit('POST', 'http://api.twitter.com/1/statuses/update.json', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, accessToken, accessTokenSecret, null, null, function (err, data, res) {
    should.not.exist(err);
    res.should.have.status(200);
    res.should.be.json;
    data = JSON.parse(data);
    should.exist(data.id_str);
    var tweetID = data.id_str;

    _delete(tweetID, accessToken, accessTokenSecret, done);
  });
}

describe('mouth', function () {
  describe('term.ie', function () {
    var credentials = {
      accessToken: null,
      accessTokenSecret: null
    };

    it('should GET a request token', function (done) {
      mouth.shit('GET', 'http://term.ie/oauth/example/request_token.php', {}, {}, null, null, 'key', 'secret', null, null, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);

        should.exist(data);
        var parsedQuery = querystring.parse(data);
        should.exist(parsedQuery.oauth_token);
        should.exist(parsedQuery.oauth_token_secret);

        credentials.accessToken = parsedQuery.oauth_token;
        credentials.accessTokenSecret = parsedQuery.oauth_token_secret;

        done();
      });
    });

    it('should GET an access token', function (done) {
      mouth.shit('GET', 'http://term.ie/oauth/example/access_token.php', {}, {}, null, null, 'key', 'secret', credentials.accessToken, credentials.accessTokenSecret, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);

        should.exist(data);
        var parsedQuery = querystring.parse(data);
        should.exist(parsedQuery.oauth_token);
        should.exist(parsedQuery.oauth_token_secret);

        credentials.accessToken = parsedQuery.oauth_token;
        credentials.accessTokenSecret = parsedQuery.oauth_token_secret;

        done();
      });
    });

    it('should make authenticated call', function (done) {
      var queryParams = {
        foo: 'bar',
        dog: 'yes'
      };
      mouth.shit('GET', 'http://term.ie/oauth/example/echo_api.php', queryParams, {}, null, null, 'key', 'secret', credentials.accessToken, credentials.accessTokenSecret, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);

        should.exist(data);
        var parsedQuery = querystring.parse(data);
        should.exist(parsedQuery.foo);
        should.equal(parsedQuery.foo, queryParams.foo);
        should.exist(parsedQuery.dog);
        should.equal(parsedQuery.dog, queryParams.dog);

        done();
      });
    });

  });

  describe('Twitter', function () {
    var credentials = {
      accessToken: null,
      accessTokenSecret: null
    };

    // config
    it('should have a valid config', function () {
      should.exist(config.twitter.consumerKey);
      should.exist(config.twitter.consumerSecret);
      should.exist(config.twitter.slave.accessToken);
      should.exist(config.twitter.slave.accessTokenSecret);
      should.exist(config.twitter.indenturedServant.username);
      should.exist(config.twitter.indenturedServant.password);
    });

    // slave
    it('should verify slave credentials', function (done) {
      _verify(config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, done);
    });

    it('should return OK from help/test', function (done) {
      var queryParams = {};
      var postParams = {};
      mouth.shit('GET', 'http://api.twitter.com/1/help/test.json', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);
        res.should.be.json;
        var data = JSON.parse(data);
        should.equal(data, 'ok');

        done();        
      });
    });

    it('should update and delete status with slave credentials', function (done) {
      _updateAndDelete(config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, done);
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
      mouth.shit('POST', 'https://api.twitter.com/oauth/access_token', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, null, null, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);

        should.exist(data);
        var parsedQuery = querystring.parse(data);
        should.exist(parsedQuery.oauth_token);
        should.exist(parsedQuery.oauth_token_secret);

        credentials.accessToken = parsedQuery.oauth_token;
        credentials.accessTokenSecret = parsedQuery.oauth_token_secret;

        done();
      });
    });

    it('should verify xAuth credentials', function (done) {
      _verify(credentials.accessToken, credentials.accessTokenSecret, done);
    });

//    it('should update and delete status with xAuth credentials', function (done) {
//      _updateAndDelete(credentials.accessToken, credentials.accessTokenSecret, done);
//    });
  });
});
