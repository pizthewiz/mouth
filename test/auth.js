
var mouth = require('../mouth'),
  should = require('should');

describe('mouth', function () {
	// https://dev.twitter.com/docs/auth/authorizing-request + https://dev.twitter.com/docs/auth/creating-signature
	it('should construct the expected Authorization header for a Twitter status update', function () {
		_getNonce= function(size) { return 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg'; };
		_getTimestamp= function() { return '1318622958'; };

		var queryParams = {'include_entities': true};
		var postParams = {'status': 'Hello Ladies + Gentlemen, a signed OAuth request!'};
		var consumerKey = 'xvz1evFS4wEEPTGEFPHBog';
		var consumerSecret = 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw';
		var userToken = '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb';
		var userSecret = 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE';
		var result = mouth.authorizationHeaderString('POST', 'https://api.twitter.com/1/statuses/update.json', queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret);
		should.equal(result, 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"');
	});
});
