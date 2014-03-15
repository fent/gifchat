var giphy = require('giphy-wrapper')('dc6zaTOxFJmzC');
var cache = require('eventvat')({ autoexpire: 3600 });

var limit = 25;
var offset = 0;
var regexp = /^(?:@\w+ )?gif (.+)/i;

module.exports = function(item, callback) {
  var config = this.config;
  var result = regexp.exec(item.message.message);
  if (result) {
    var query = encodeURIComponent(result[1].trim());
    if (cache.exists(query)) {
      chooseGIF(cache.get(query));

    } else {
      giphy.search(query, limit, offset, function(err, data) {
        if (err) return callback(err);
        if (!data || !data.data || !data.data.length) {
          return callback(new Error('no gifs found'));
        }

        data = data.data;
        cache.set(query, data);
        chooseGIF(data);
      });
    }
  }

  function chooseGIF(data) {
    var len = data.length;
    var randi = ~~(Math.random() * len);
    console.log('found ' + len + ' images: [' + randi + ']');
    var img = data[randi].images.original.url;
    callback(null, {
      message: config.format === 'html' ?
        '<a href="' + img + '"><img src="' + img + '" /></a>' : img
    });
  }
  return result;
};
