var async   = require('async');
var Hipchat = require('./hipchat');
var config  = require('../config.json');
var hipchat = new Hipchat(config.webhooks_token);

var removeWebhooks = require('./removeWebhooks');
var rooms = Object.keys(config.rooms);
var e = 'room_message';
var pattern = '';

var hookname = (process.env.NODE_ENV || '') + config.hookname;
removeWebhooks(rooms, function(err) {
  if (err) return console.error(err.message);

  async.each(rooms, function(room, callback) {
    console.log('[' + room + '] creating webhook');
    var options = {
      url: config.hookurl,
      event: e,
      name: hookname,
    };
    if (pattern) {
      options.pattern = pattern;
    }
    hipchat.createWebhook(room, options, callback);
  }, function(err) {
    if (err) return console.error(err.message);
    console.log('webhooks created');
    require('./bot');
  });
});


// Make sure to cleanup on exit.
function onexit() {
  removeWebhooks(rooms, function(err) {
    if (err) console.error(err.message);
    console.log('exiting...');
    process.exit();
  });
}

process.stdin.resume();
process.on('exit', onexit);
process.on('SIGINT', onexit);
process.on('uncaughtException', function(err) {
  console.error('uncaught exception');
  console.error(err.message);
  onexit();
});
