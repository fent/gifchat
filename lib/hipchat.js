var querystring = require('querystring');
var request     = require('request');
var BASE        = 'https://api.hipchat.com/v2/';


/**
 * @constructor
 * @param {String} token
 */
var Hipchat = module.exports = function(token) {
  this.token = token;
};


/**
 * Creates a general callback used in all API calls.
 *
 * @param {Function(!Error, Object)} callback
 * @retrn {Function(Error, http.Response, Object)}
 */
function apiCallback(callback) {
  return function(err, res, data) {
    if (err) return callback(err);
    if (data && data.error) {
      err = new Error(data.error.message);
      err.code = data.error.code;
      err.type = data.error.type;
      callback(err);
      return;
    }
    callback(null, data);
  };
}


/**
 * @param {String} method
 * @param {String} resource
 * @param {!Object} params
 * @param {Function(!Error, Object)} callback
 */
Hipchat.prototype.request = function(method, resource, params, callback) {
  var url = BASE + resource;
  if (typeof params === 'function') {
    callback = params;
    params = null;
  } else if (!callback) {
    callback = function() {};
  }
  params = params || {};
  params.auth_token = params.auth_token || this.token;
  url += '?' + querystring.stringify(params);
  request({
    method: method,
    url: url,
    json: true
  }, apiCallback(callback));
};


/**
 * @param {String} resource
 * @param {Object} params
 * @param {Function(!Error, Object)} callback
 */
Hipchat.prototype.get = function(resource, params, callback) {
  this.request('get', resource, params, callback);
};


/**
 * @param {String} resource
 * @param {Object} params
 * @param {Function(!Error, Object)} callback
 */
Hipchat.prototype.del = function(resource, params, callback) {
  this.request('delete', resource, params, callback);
};


/**
 * @param {String} resource
 * @param {Object} body
 * @param {Function(!Error, Object)} callback
 */
Hipchat.prototype.post = function(resource, body, callback) {
  var url = BASE + resource +
    '?auth_token=' + (body.auth_token || this.token);
  request({
    method: 'post',
    url: url,
    body: body,
    json: true
  }, apiCallback(callback));
};


/**
 * Sends message to room.
 *
 * @param {String} room
 * @param {!Object} params
 * @param {Function(!Error, Object)} callback
 */
Hipchat.prototype.notify = function(room, params, callback) {
  this.post('room/' + room + '/notification', params, callback);
};


/**
 * @param {String} room
 * @param {Object} params
 * @param {Function(!Error)} callback
 */
Hipchat.prototype.createWebhook = function(room, params, callback) {
  params.event = params.event || 'room_message';
  this.post('room/' + room + '/webhook', params, callback);
};


/**
 * @param {String} room
 * @param {String} hookID
 * @param {Function(!Error)} callback
 */
Hipchat.prototype.deleteWebhook = function(room, hookID, callback) {
  this.del('room/' + room + '/webhook/' + hookID, callback);
};


/**
 * @param {String} room
 * @param {!Object} params
 * @param {Functio(!Error, Object)} callback
 */
Hipchat.prototype.getWebhooks = function(room, params, callback) {
  this.get('room/' + room + '/webhook', params, callback);
};
