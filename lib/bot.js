var fs      = require('fs');
var path    = require('path');
var connect = require('connect');
var Hipchat = require('./hipchat');
var config  = require('../config.json');
var hipchat = new Hipchat(config.webhooks_token);

// Load commands from directory.
var commands = {};
var commandsDir = path.join(__dirname, '../commands');
var files = fs.readdirSync(commandsDir);
files.forEach(function(file) {
  var name = path.basename(file, '.js');
  var cmdconfig = config.commands[name] || {};
  if (cmdconfig.enabled !== false) {
    var module = require(path.join(commandsDir, file));
    module.config = cmdconfig;
    commands[name] = module;
  }
});

connect()
  .use(connect.logger('tiny'))
  .use(connect.json())
  .use(function(req, res) {
    res.writeHead(200);
    res.end('ok\n');

    if (!req.body || !req.body.item) { return; }
    var item = req.body.item;
    var message = item.message;
    console.log(message.from.name + ': ' + message.message);

    var room = item.room;
    var token = config.rooms[room.name];
    if (!token) {
      return console.error('no token for room', room);
    }

    for (var cmd in commands) {
      var match = call(cmd, commands[cmd], item, token);
      // Once a command finds a match, stop checking other commands.
      if (match) { break; }
    }

  }).listen(config.port, function(err) {
    if (err) return console.error(err.message);
    console.log('bot listening on http://localhost:' + config.port);
  });

function call(cmd, fn, item, token) {
  return fn.call(fn, item, function(err, data) {
    var msg;
    if (err) {
      console.error(err.message);
      msg = '[' + cmd + '][error] ' + err.message;
    } else {
      msg = data.message;
    }

    var config = fn.config;
    hipchat.notify(item.room.id, {
      message: msg,
      color: data && data.color || config.color,
      auth_token: token,
      message_format: data && data.format || config.format,
    }, function(err) {
      if (err) return console.error(err.message);
    });
  });
}
