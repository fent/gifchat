var async   = require('async');
var Hipchat = require('./hipchat');
var config  = require('../config.json');
var hipchat = new Hipchat(config.webhooks_token);

var removeWebhooks = require('./removeWebhooks');
var rooms = Object.keys(config.rooms);
var e = 'room_message';
var pattern = '';

removeWebhooks(rooms, function(err) {
  if (err) return console.error(err);

  async.each(rooms, function(room, callback) {
    console.log('[' + room + '] creating webhook');
    var options = {
      url: config.hookurl,
      event: e,
      name: config.hookname,
    };
    if (pattern) {
      options.pattern = pattern;
    }
    hipchat.createWebhook(room, options, callback);
  }, function(err) {
    if (err) return console.error(err);
    console.log('webhooks created');
    require('./bot');
  });
});


// Make sure to cleanup on exit.
process.on('SIGINT', function() {
  removeWebhooks(rooms, function(err) {
    if (err) return console.error(err.message);
    console.log('exiting...');
    process.exit();
  });
});
