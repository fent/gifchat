# gifchat

A giphy bot for hipchat. Uses the [webhook endpoint endpoint](https://www.hipchat.com/docs/apiv2/method/create_webhook) in order to be realtime.

# Install

    $ git clone git@github.com:fent/gifchat.git
    $ cd gifchat
    $ npm install
    $ cp tmp.config.json config.json
    $ # edit the config.json file with your auth keys and host.
    $ npm start

### config.json

```javascript
{
  // Needed to create webhooks, must have admin privileges for the room.
  "webhooks_token": "",

  // List of rooms along with their auth tokens, which are per room.
  // Can be generated here: https://hipchat.com/rooms
  "rooms": {
    "test": "",
    "product": ""
  },
  "port": 5000,

  // Needed for webhooks.
  "host": "http://myhost.com:5000",

  // Each command gets their own config.
  "commands": {
    "gif": {
      "enabled": true,

      // Can be yellow, red, green, purple, gray, random.
      "color": "gray",

      // If html format, will post the gif as an image tag that cannot be hidden.
      // With text format, a link will be posted and it will appear as if a
      // regular user has posted a link to a gif.
      "format": "html"
    }
  }
}
```

# License
MIT
