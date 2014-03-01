var config = require('./config.json');
var rooms  = Object.keys(config.rooms);

require('./lib/removeWebhooks')(rooms, function(err) {
  if (err) return console.error(err);
  console.log('webhooks removed!');
});
