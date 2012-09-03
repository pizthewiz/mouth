
/*
                     .==++==.     .=+=.
                   +=+@@@@@@++++++@@@@@++
                 ==+=+++++@=+=++++++++@=++
               .+++=+=+++=+=++++++=+=+==++:
             .=++= @@@@@@&+++++@@@@&+++++++:
           .++='     &@@@@@@@@@@@@@@@@++=+++=
        .=+=:'    .==+=.     &@@@@'++@@,. +=+=+.
          +=++ .++=+++==  .====+=++++++=+=+ =+++'
            :++++=@@=+ =+=+=+++++@@++++= +++++
           ++=++@@++ +=+++==+=+@@++++= ++=+
          +=++@@+++ +==+++===@@#+++= =++++
         =+++@@==='+=======+@@++== +++++'
        ====@@==='=======+=@@++== =++++
       ++++@@@=+.==+======@@@=== ==+=+
       ++==@@+++=++=+====@@@+== ===++
       ++=++====+=+=+==@@@@=== =+++
       '=+=+====+=+=+==@@@=== .='
         +==++=++=+=+=+=+==='
           +=+++=========='
             ''=+====='

	MOUTH - OAuth 1.0 wrapper
	http://github.com/pizthewiz/mouth
*/

var crypto = require('crypto'),
	parse = require('url').parse,
	format = require('url').format,
	querystring = require('querystring'),
	http = require('http'),
	https = require('https');

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
};
_clone = function(source) {
	return _extend({}, source);
};
_sortedKeys = function (obj) {
  return Object.keys(obj).sort();
};
_escape = function (obj) {
	// http://en.wikipedia.org/wiki/Percent-encoding
	// encode !#$&'()*+,/:;=?@[]
	var str = obj.toString().replace(/!/g, '%21').replace(/#/g, '%23').replace(/\$/g, '%24').replace(/&/g, '%26').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\+/g, '%2B').replace(/,/g, '%2C').replace(/\//g, '%2F').replace(/:/g, '%3A').replace(/;/g, '%3B').replace(/=/g, '%3D').replace(/\?/g, '%3F').replace(/@/g, '%40').replace(/\[/g, '%5B').replace(/\]/g, '%5D');
	// encode space "<>\^`{|} but not %-._~
	return str.replace(/\ /g, '%20').replace(/\"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\\/g, '%5C').replace(/\^/g, '%5C').replace(/\`/g, '%60').replace(/\{/g, '%7B').replace(/\|/g, '%7C').replace(/\}/g, '%7D');
};

/**
 * authorizationHeaderString - generate OAuth 1.0 Authorization header content string
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} queryParams
 * @param {Object} postParams
 * @param {String} consumerKey
 * @param {String} consumerSecret
 * @param {String} userToken
 * @param {String} userSecret
 * @param {Object} extraOauthParams
 * @api public
 */
exports.authorizationHeaderString = authorizationHeaderString = function (method, url, queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, extraOauthParams) {
	method = method.toUpperCase();
	queryParams = queryParams || {};
	postParams = postParams || {};
  userSecret = userSecret || '';

	// TODO - consider stripping queryParams off url, adding to queryParams
	//	lower protocol and remote port
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
		oauthParams.oauth_token = userToken;
	}
	if (extraOauthParams) {
		_extend(oauthParams, extraOauthParams);
	}

	var allParams = _clone(oauthParams);
	_extend(allParams, queryParams);
	_extend(allParams, postParams);
	var paramString = _sortedKeys(allParams).map(function (key) {
		return _escape(key) + '=' + _escape(allParams[key]);
	}).join('&');

	var base = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(paramString);
	var key = consumerSecret + '&' + userSecret;
	var sig = crypto.createHmac('sha1', key).update(base).digest('base64');
	oauthParams.oauth_signature = sig;

	var headerString = 'OAuth' + _sortedKeys(oauthParams).map(function (key) {
		return ' ' + encodeURIComponent(key) + '="' + encodeURIComponent(oauthParams[key]) + '"';
	}).join(',');
	return headerString;
};

/**
 * authenticatedRequest - wrapper for the http and https request function with an OAuth Authentication header
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} queryParams
 * @param {Object|Buffer} postContent
 * @param {String} contentType
 * @param {String} consumerKey
 * @param {String} consumerSecret
 * @param {String} userToken
 * @param {String} userSecret
 * @param {Object} extraOauthParams
 * @param {Function} callback
 * @api public
 */
exports.authenticatedRequest = function (method, url, queryParams, postContent, contentType, consumerKey, consumerSecret, userToken, userSecret, extraOauthParams, callback) {
	// strip query params off url and place in queryParams
	var pairs = parse(url);
	if (pairs.query) {
		var q = querystring.parse(pairs.query);
		// queryParams overrides query params in url
		queryParams = _extend(q, queryParams || {});

		// recraft url without query
		pairs.search = ''; pairs.query = {};
		url = format(pairs);
	}

	// retool postContent as postParams if it is an object
	var postParams = Buffer.isBuffer(postContent) ? null : postContent;
	var authString = authorizationHeaderString(method, url, queryParams, postParams, consumerKey, consumerSecret, userToken, userSecret, extraOauthParams);

	// put queryParams into parsed url results
	if (queryParams) {
		pairs.search = ''; pairs.query = queryParams;
	}

	var options = {
		'hostname': pairs.hostname,
		'path': pairs.path, // includes query when appropriate
		'method': method,
		'headers': {
			'User-Agent': 'Node.js Mouth',
			'Host': pairs.hostname,
			'Accept': '*/*',
			'Authorization': authString
		}
	};
	if (pairs.port) {
		options.port = parseInt(pairs.port, 10);
	}
	if (method === 'POST') {
		contentType = contentType || 'application/x-www-form-urlencoded';
		var contentLength = 0;
		if (postParams) {
			postContent = querystring.stringify(postParams);
			contentLength = Buffer.byteLength(postContent);
		} else {
			contentLength = postContent.length;
		}
		options['headers']['Content-Type'] = contentType;
		options['headers']['Content-Length'] = contentLength;
	}

	// internal callback handler
	var cb = function (err, data, res) {
		cb = function () {};
		callback(err, data, res);
	};

	// issue http request
	var m = pairs.protocol === 'https:' ? https : http;
	var req = m.request(options, function (res) {
		var data = '';

		res.setEncoding('utf8');
		res.on('data', function (d) {
      data += d;
    });
    res.on('end', function () {
      cb(null, data, res);
    });
    res.on('close', function () {
      cb(null, data, res);
    });
	});
//	console.log(util.inspect(req));

	req.on('error', function (err) {
		cb(err);
	});

	if (postContent) {
		req.write(postContent);
	}
	req.end();
};
