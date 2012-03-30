
var Mouth = require('../mouth'),
  config = require('./config'),
  should = require('should'),
  util = require('util');

describe('Mouth', function () {
  var m = null;
  beforeEach(function () {
    m = new Mouth();
  });

  describe('Twitter', function () {
    it('should verify slave credentials', function (done) {
      m.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', {}, {}, null, null, config.twitter.consumerKey, config.twitter.consumerSecret, config.twitter.slave.accessToken, config.twitter.slave.accessTokenSecret, null, null, function (err, data, res) {
          res.statusCode.should.eql(200);
          done();
      });
    });

    // TODO - update and delete
    // TODO - update with media and delete

    // TODO - xAuth + verify credentials
  });

});
