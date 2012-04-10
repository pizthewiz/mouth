
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
exports.version = '0.0.2-pre';

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

Object.prototype._sortedKeys = function () {
  return Object.keys(this).sort();
};
Object.prototype._cloneWithSortedKeys = function () {
  var shadow = {}, self = this;
  this._sortedKeys().forEach(function (key) { shadow[key] = self[key]; });
  return shadow;
};

exports.shit = function (method, url, queryParams, postParams, postBuffer, contentType, consumerKey, consumerSecret, userToken, userSecret, callbackURL, verifier, callback) {
  queryParams = queryParams || {};
  postParams = postParams || {};
  postBuffer = postBuffer;
  contentType = contentType || 'application/x-www-form-urlencoded';
  userSecret = userSecret || '';

  var oauthParams = {
    oauth_nonce: _getNonce(42),
    oauth_version: '1.0',
    oauth_timestamp: _getTimestamp(),
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1'
  };
  // optional params
  if (userToken && userToken.length > 0) {
    oauthParams.oauth_token = userToken;
  }
  if (callbackURL && callbackURL.length > 0) {
    oauthParams.oauth_callback = callbackURL;
  }
  if (verifier && verifier.length > 0) {
    oauthParams.oauth_verifier = verifier;
  }

  var parts = [];
  oauthParams._sortedKeys().forEach(function (key) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(oauthParams[key]));
  });

  queryParams._sortedKeys().forEach(function (key) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]));
  });
  var flatQuery = querystring.stringify(queryParams._cloneWithSortedKeys());

  postParams._sortedKeys().forEach(function (key) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(postParams[key]));
  });
  var flatBody = querystring.stringify(postParams._cloneWithSortedKeys());
  parts.sort();

  var base = encodeURIComponent(method) + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(parts.join('&'));
  var key = consumerSecret + '&' + userSecret;
  var sig = crypto.createHmac('sha1', key).update(base).digest('base64');

  var authHeader = 'OAuth oauth_signature="' + encodeURIComponent(sig) + '"';
  oauthParams._sortedKeys().forEach(function (key) {
    authHeader += ', ' + key + '="' + encodeURIComponent(oauthParams[key]) + '"';
  });

  var contentLength = postBuffer ? postBuffer.length : Buffer.byteLength(flatBody);

  if (flatQuery.length > 0) {
    url += '?' + flatQuery;
  }
  var parsedURL = URL.parse(url, false);
  var headers = {
    'Authorization': authHeader,
    'Content-Type': contentType,
    'Content-Length': contentLength,
    'Host': parsedURL.host,
    'Accept': '*/*',
    'Connection': 'close',
    'User-Agent': 'Node authentication'
  };
//  console.log('headers:' + util.inspect(headers));

  var port = parsedURL.port || (parsedURL.protocol === 'http:' ? 80 : 443);
  var path = parsedURL.pathname || '/';
  if (parsedURL.query) {
    path += '?' + parsedURL.query;
  }

  var opts = {
    host: parsedURL.hostname,
    port: port,
    path: path,
    method: method,
    headers: headers
  };
//  console.log(opts);

  var callbackCalled = false;
  var internalCallback = function (data, res) {
    if (callbackCalled) {
      return;
    }
    callbackCalled = true;

    if (res.statusCode >= 200 && res.statusCode <= 299) {
      callback(null, data, res);
    } else {
      // TODO - handle redirects
      callback({statusCode: res.statusCode, data: data}, data, res);
    }
  };

  var data = '';
  var selectedModule = (parsedURL.protocol === 'https:' ? https : http);
  var req = selectedModule.request(opts, function (res) {
    res.on('data', function (d) {
      data += d;
    });
    res.on('end', function () {
      internalCallback(data, res);
    });
    res.on('close', function () {
      internalCallback(data, res);
    });
  });
  req.on('error', function (err) {
    callbackCalled = true;
    callback(err, data);
  });

  if (contentLength > 0) {
    if (postBuffer) {
      req.write(postBuffer);
    } else {
      req.write(flatBody);
    }
  }
  req.end();
};
