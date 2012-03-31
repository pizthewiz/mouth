
var Mouth = require('../mouth'),
  config = require('./config'),
  should = require('should'),
  querystring = require('querystring'),
  util = require('util');

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
    var m = null;
    beforeEach(function () {
      m = new Mouth();
    });

    it('should verify slave credentials', function (done) {
      m.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', {}, {}, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, null, null, function (err, data, res) {
        should.not.exist(err);
        res.should.have.status(200);
        res.should.be.json;
//        console.log(util.inspect(data));
        done();
      });
    });

/*
    it('should update status with slave credentials', function (done) {
      var queryParams = {};
      var postParams = {
        'status': '{tmp status generated by Mouth test suite}'
      };
      m.shit('POST', 'http://api.twitter.com/1/statuses/update.json', queryParams, postParams, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, null, null, function (err, data, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.should.be.json;
          done();
      });
    });
*/

    // TODO - update and delete
    // TODO - update with media and delete

    // xAuth + verify credentials
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

        m.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', {}, {}, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, parsedQuery.oauth_token, parsedQuery.oauth_token_secret, null, null, function (err, data, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.should.be.json;

          done();
        });

      });
    });

  });

});
