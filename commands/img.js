var client = require('google-images');
var cache  = require('eventvat')({ autoexpire: 3600 });
var regexp = /^[a-zA-Z0-9-_ .]+\.(?:gif|png|jpg|jpeg)$/;

module.exports = function(item, callback) {
  var config = this.config;
  var result = regexp.exec(item.message.message);
  if (result) {
    var query = encodeURIComponent(result[0].trim());
    if (cache.exists(query)) {
      choose(cache.get(query));

    } else {
      client.search(query, function(err, images) {
        if (err) return callback(err);

        cache.set(query, images);
        choose(images);
      });
    }
  }

  function choose(data) {
    console.log('found ' + data.length + ' images');
    var img = data[0].url;
    callback(null, {
      message: config.format === 'html' ?
        '<a href="' + img + '"><img src="' + img + '" /></a>' : img
    });
  }
  return result;
};

