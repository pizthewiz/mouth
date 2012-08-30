
/*
    _/\/\______/\/\____/\/\/\/\____/\/\____/\/\__/\/\/\/\/\/\__/\/\____/\/\_
    _/\/\/\__/\/\/\__/\/\____/\/\__/\/\____/\/\______/\/\______/\/\____/\/\_
    _/\/\/\/\/\/\/\__/\/\____/\/\__/\/\____/\/\______/\/\______/\/\/\/\/\/\_
    _/\/\__/\__/\/\__/\/\____/\/\__/\/\____/\/\______/\/\______/\/\____/\/\_
    _/\/\______/\/\____/\/\/\/\______/\/\/\/\________/\/\______/\/\____/\/\_
    ________________________________________________________________________
*/

var crypto = require('crypto'),
  querystring = require('querystring'),
  URL = require('url'),
  https = require('https'),
  http = require('http'),
  util = require('util');

exports = module.exports = {};
exports.version = '0.0.3-pre';

// yoinked from node-oauth
NONCE_CHARS= [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n',
  'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
  'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
  'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
  '4','5','6','7','8','9'
];
_getNonce= function(size) {
   var result = [];
   var chars= NONCE_CHARS;
   var char_pos;
   var nonce_chars_length= chars.length;

   for (var i = 0; i < size; i++) {
       char_pos= Math.floor(Math.random() * nonce_chars_length);
       result[i]=  chars[char_pos];
   }
   return result.join('');
};
_getTimestamp= function() {
  return Math.floor( (new Date()).getTime() / 1000 );
};
// inspired by _.
_extend = function(dest, source) {
	Object.keys(source).forEach(function (key) { dest[key] = source[key]; });
	return dest;
}
_clone = function(source) {
	return _extend({}, source);
};
_sortedKeys = function (obj) {
  return Object.keys(obj).sort();
};


/**
 * Generate the OAuth 1.0 Authorization header content
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} queryParams
 * @param {Object} postParams
 * @param {String} contentType
 * @param {String} consumerKey
 * @param {String} consumerSecret
 * @param {String} userToken
 * @param {String} userSecret
 * @api public
 */
exports.authorizationHeaderString = function (method, url, queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, callbackURL) {
	method = method.toUpperCase();
	queryParams = queryParams || {};
	postParams = postParams || {};
  userSecret = userSecret || '';

	// TODO - consider stripping queryParams off url, adding to queryParams
	// TODO - validate shit
	//	method legit/uppercase
	//	no postParams unless POST'ing
	//	consumerKey/Secret is good

	var oauthParams = {
		'oauth_nonce': _getNonce(42),
		'oauth_version': '1.0',
		'oauth_timestamp': _getTimestamp(),
		'oauth_consumer_key': consumerKey,
		'oauth_signature_method': 'HMAC-SHA1'
	};
	if (userToken && userToken !== '') {
		oauthParams['oauth_token'] = userToken;
	}
	if (callbackURL && callbackURL !== '') {
		oauthParams['oauth_callback'] = callbackURL;
	}

	var allParams = _clone(oauthParams);
	_extend(allParams, queryParams);
	_extend(allParams, postParams);
	var parts = _sortedKeys(allParams).map(function (key) {
		return escape(key) + '=' + escape(allParams[key]);
	});
	var paramString = parts.join('&').replace('+', '%2B'); // damned + not caught by escape()?!

	var base = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(paramString);
	var key = consumerSecret + '&' + userSecret;
	var sig = crypto.createHmac('sha1', key).update(base).digest('base64');
	oauthParams['oauth_signature'] = sig;

	var headerString = 'OAuth';
	headerString += _sortedKeys(oauthParams).map(function (key) {
		return ' ' + encodeURIComponent(key) + '="' + encodeURIComponent(oauthParams[key]) + '"';
	}).join(',');
	return headerString;
};
