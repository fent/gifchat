var connect = require('connect');
var Hipchat = require('./hipchat');
var gif     = require('./gif');
var config  = require('../config.json');
var hipchat = new Hipchat(config.webhooks_token);

var regexp = /^(?:@\w+ )?gif (.+)/i;
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

    var result = regexp.exec(message.message);
    if (result) {
      var query = result[1];
      gif(query, function(err, img) {
        var msg;
        if (err) {
          console.error(err);
          msg = '[error] [' + query + '] ' + err.message;
        } else {
          console.log('got gif', img);
          msg = config.format === 'html' ?
            '<img src="' + img + '" />' : img;
        }
        hipchat.notify(item.room.id, {
          message: msg,
          color: config.color,
          auth_token: token,
          message_format: config.format,
        }, function(err) {
          if (err) return console.error(err);
        });
      });
    }
  }).listen(config.port, function(err) {
    if (err) return console.error(err.message);
    console.log('bot listening on http://localhost:' + config.port);
  });
