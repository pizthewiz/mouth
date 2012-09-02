
var mouth = require('../mouth'),
  util = require('util'),
  querystring = require('querystring');

var config = {
  // application key and secret from https://dev.twitter.com/apps -> 'My Applications'
  consumerKey: null,
  consumerSecret: null,
  // access token for your application
  userToken: null,
  userSecret: null
};

if (!config.consumerKey || !config.consumerSecret || !config.userToken || !config.userSecret) {
	console.log('ERROR - invalid configuration');
	return;
}

// verify application and user credentials
mouth.authenticatedRequest('GET', 'https://api.twitter.com/1/account/verify_credentials.json', null, null, null, config.consumerKey, config.consumerSecret, config.userToken, config.userSecret, null, function (err, data, res) {
	if (err) {
		console.log('ERROR - failed to verify credentials - ' + util.inspect(err));
    process.exit(code=1);
	}

	console.log('RES: ' + data);
});


// post status update
var params = {
	'status': 'giving Mouth a quick lashing'
};
mouth.authenticatedRequest('POST', 'https://api.twitter.com/1/statuses/update.json', null, params, null, config.consumerKey, config.consumerSecret, config.userToken, config.userSecret, null, function (err, data, res) {
	if (err) {
		console.log('ERROR - failed to get xAuth access token - ' + util.inspect(err));
    process.exit(code=1);
	}

	console.log('RES: ' + data);
});


// authenticate user via xAuth
params = {
	'x_auth_username': 'USERNAME',
	'x_auth_password': 'PASSWORD',
	'x_auth_mode': 'client_auth'
};
mouth.authenticatedRequest('POST', 'https://api.twitter.com/oauth/access_token', null, params, null, config.consumerKey, config.consumerSecret, null, null, null, function (err, data, res) {
	if (err) {
		console.log('ERROR - failed to get xAuth access token - ' + util.inspect(err));
    process.exit(code=1);
	}

	params = querystring.parse(data);
	var userToken = params['oauth_token'];
	var userSecret = params['oauth_token_secret'];
	console.log('userToken:' + userToken);
	console.log('userSecret:' + userSecret);
});
