
var Mouth = require('../mouth'),
  util = require('util');

var config = {
  // application key and secret from https://dev.twitter.com/apps -> 'My Applications'
  consumerKey: null,
  consumerSecret: null,
  // access token for your application
  accessToken: null,
  accessTokenSecret: null
};

if (!(config.consumerKey && config.consumerSecret && config.accessToken && config.accessTokenSecret)) {
  console.log('ERROR - static twitter config properties are required');
  process.exit(code=1);
}

var m = new Mouth();
var queryParams = {}, postParams = {};
m.shit('GET', 'https://api.twitter.com/account/verify_credentials.json', queryParams, postParams, null, null, config.consumerKey, config.consumerSecret, config.accessToken, config.accessTokenSecret, null, null, function (err, data, res) {
  if (err) {
    console.log('ERROR - failed to verify provided credentials - ' + util.inspect(err));
    process.exit(code=1);
  }

  data = JSON.parse(data);
  var screenName = data.screen_name;

  postParams = {
    status: 'is getting rather Mouthy'
  };
  m.shit('POST', 'http://api.twitter.com/1/statuses/update.json', queryParams, postParams, null, null, config.consumerKey, config.consumerSecret, config.accessToken, config.accessTokenSecret, null, null, function (err, data, res) {
    if (err) {
      console.log('ERROR - failed to update twitter status - ' + util.inspect(err));
      process.exit(code=1);
    }

    data = JSON.parse(data);
    var hackyLink = 'http://twitter.com/#!/' + screenName + '/status/' + data.id_str;
    console.log('successfully tweeted - ' + hackyLink);
  });
});
