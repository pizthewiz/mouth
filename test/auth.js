
var mouth = require('../mouth'),
  should = require('should'),
  util = require('util');

String.prototype.beginsWith = function (string) {
	return(this.indexOf(string) === 0);
};

function _equalHeaderSubcontents(actual, expected) {
	should(actual.beginsWith('OAuth '));

	// strip leading 'OAuth ' and split into pairs
	var actualParamPairs = actual.replace('OAuth ', '').split(', ');
	var expectedParamPairs = expected.replace('OAuth ', '').split(', ');

	var actualParams = {};
	actualParamPairs.forEach(function (pair) {
		var l = pair.split('=');
		actualParams[l[0]] = l[1].replace(/\"/g, '');
	});

	var expectedParams = {};
	expectedParamPairs.forEach(function (pair) {
		var l = pair.split('=');
		expectedParams[l[0]] = l[1].replace(/\"/g, '');
	});
	// remove optional realm param if not present in actual
	if (!actualParams.hasOwnProperty('realm')) {
		delete expectedParams['realm'];
	}

	var actualKeys = Object.keys(actualParams);
	var expectedKeys = Object.keys(expectedParams);

	actualKeys.should.have.length(expectedKeys.length);
	expectedKeys.forEach(function (key) {
		actualParams.should.have.property(key, expectedParams[key]);
	});
}

describe('mouth', function () {
	// https://dev.twitter.com/docs/auth/authorizing-request + https://dev.twitter.com/docs/auth/creating-signature
	it('should construct expected Authorization header for Twitter status update', function () {
		_getNonce= function(size) { return 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg'; };
		_getTimestamp= function() { return '1318622958'; };

		var queryParams = {'include_entities': true};
		var postParams = {'status': 'Hello Ladies + Gentlemen, a signed OAuth request!'};
		var consumerKey = 'xvz1evFS4wEEPTGEFPHBog';
		var consumerSecret = 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw';
		var userToken = '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb';
		var userSecret = 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE';
		var result = mouth.authorizationHeaderString('POST', 'https://api.twitter.com/1/statuses/update.json', queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, null);
		should.equal(result, 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"');
		_equalHeaderSubcontents(result, 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"');
	});

	// http://oauth.net/core/1.0a/#anchor5
	it('should generate (mostly) expected header for OAuth 1.0A spec example request', function () {
		_getNonce= function(size) { return 'kllo9940pd9333jh'; };
		_getTimestamp= function() { return '1191242096'; };
		
		var queryParams = {'file': 'vacation.jpg', 'size': 'original'};
		var postParams = null;
		var consumerKey = 'dpf43f3p2l4k3l03';
		var consumerSecret = 'kd94hf93k423kf44';
		var userToken = 'nnch734d00sl2jdk';
		var userSecret = 'pfkkdhi9sl3r4s00';
		var result = mouth.authorizationHeaderString('GET', 'http://photos.example.net/photos', queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, null);
		// NB - strangely the expected params are not ordered and has an optional realm param
//		should.equal(result, 'OAuth realm="http://photos.example.net/", oauth_consumer_key="dpf43f3p2l4k3l03", oauth_token="nnch734d00sl2jdk", oauth_signature_method="HMAC-SHA1", oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D", oauth_timestamp="1191242096", oauth_nonce="kllo9940pd9333jh", oauth_version="1.0"');
		_equalHeaderSubcontents(result, 'OAuth realm="http://photos.example.net/", oauth_consumer_key="dpf43f3p2l4k3l03", oauth_token="nnch734d00sl2jdk", oauth_signature_method="HMAC-SHA1", oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D", oauth_timestamp="1191242096", oauth_nonce="kllo9940pd9333jh", oauth_version="1.0"');
	});

	// http://term.ie/oauth/example/index.php
	it('should construct expected Authorization header for term.io request token request example', function () {
		_getNonce= function(size) { return '07d2f423bd689a4eafd1e316f7fc3b5e'; };
		_getTimestamp= function() { return '1346348131'; };

		var queryParams = null;
		var postParams = null;
		var consumerKey = 'key';
		var consumerSecret = 'secret';
		var userToken = null;
		var userSecret = null;
		var result = mouth.authorizationHeaderString('GET', 'http://term.ie/oauth/example/request_token.php', queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, null);
		// NB - the example in question provides the query params not the header string, something will need to be sorted out in regards to that
		should.equal(result, 'OAuth oauth_consumer_key="key", oauth_nonce="07d2f423bd689a4eafd1e316f7fc3b5e", oauth_signature="Z%2FY34vJ%2BdRS5xNhD8f0MZgHOe7k%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1346348131", oauth_version="1.0"');
		_equalHeaderSubcontents(result, 'OAuth oauth_consumer_key="key", oauth_nonce="07d2f423bd689a4eafd1e316f7fc3b5e", oauth_signature="Z%2FY34vJ%2BdRS5xNhD8f0MZgHOe7k%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1346348131", oauth_version="1.0"');
	});
	it('should construct expected Authorization header for term.io access token request example', function () {
		_getNonce= function(size) { return 'bce4883d7e2e61e7c8a2b978cb91fc65'; };
		_getTimestamp= function() { return '1346348131'; };

		var queryParams = null;
		var postParams = null;
		var consumerKey = 'key';
		var consumerSecret = 'secret';
		var userToken = 'requestkey';
		var userSecret = 'requestsecret';
		var result = mouth.authorizationHeaderString('GET', 'http://term.ie/oauth/example/access_token.php', queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, null);
		// NB - the example in question provides the query params not the header string, something will need to be sorted out in regards to that
		should.equal(result, 'OAuth oauth_consumer_key="key", oauth_nonce="bce4883d7e2e61e7c8a2b978cb91fc65", oauth_signature="TU3idtc9mybcPV2u5uMKbHe2kY4%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1346348131", oauth_token="requestkey", oauth_version="1.0"');
		_equalHeaderSubcontents(result, 'OAuth oauth_consumer_key="key", oauth_nonce="bce4883d7e2e61e7c8a2b978cb91fc65", oauth_signature="TU3idtc9mybcPV2u5uMKbHe2kY4%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1346348131", oauth_token="requestkey", oauth_version="1.0"');
	});
});
