var fs      = require('fs');
var path    = require('path');
var connect = require('connect');
var morgan  = require('morgan');
var json    = require('body-parser').json;
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

// Some defaults in case not specified in the callback or config.
var defaultColor = 'yellow';
var defaultFormat = 'text';

connect()
  .use(morgan('tiny'))
  .use(json())
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
    var config = fn.config;
    var msg, color, format;

    if (err) {
      console.error(err.message);
      msg = '[' + cmd + '][error] ' + err.message;
      color = 'red';
      format = 'text';
    } else {
      msg = data.message;
      color = data.color || config.color || defaultColor;
      format = data.format || config.format || defaultFormat;
      console.log('[' + cmd + '] ' + msg);
    }

    hipchat.notify(item.room.id, {
      message: msg,
      color: color,
      auth_token: token,
      message_format: format,
    }, function(err) {
      if (err) return console.error(err.message);
    });
  });
}
