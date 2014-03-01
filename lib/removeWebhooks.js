var async   = require('async');
var Hipchat = require('./hipchat');
var config  = require('../config.json');
var hipchat = new Hipchat(config.webhooks_token);

// Removes past webhooks created by gifchat.
module.exports = function(rooms, callback) {
  async.each(rooms, function(room, callback) {
    hipchat.getWebhooks(room, function(err, webhooks) {
      if (err) return callback(err);

      console.log('checking webhooks for room [' + room + ']');
      var hooks = webhooks.items
        .filter(function(hook) { return hook.name === config.hookname; })
        .map(function(hook) { return hook.id; });
      async.each(hooks, function(hookID, callback) {
        console.log('[' + room + '] deleting webhook:', hookID);
        hipchat.deleteWebhook(room, hookID, callback);
      }, callback);
    });
  }, callback);
};
