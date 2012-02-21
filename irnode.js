console.log('Starting irNode');

var irc = require('irc'),
    Rdio = require('./rdio'),
    cred = require('./rdio_cred');
var client = new irc.Client('dot.cclub', 'irNode', {
      channels: ['#geekboy']
});

var rdio = new Rdio([cred.RDIO_CONSUMER_KEY, cred.RDIO_CONSUMER_SECRET]);

client.join('#geekboy');

function message_parsing(from, to, message) {
  var matching = message.match(/\bhttp\:\/\/rd\.io\/x\/([0-9\w\-]+)\b/);
  if (matching) {
    rdio_object(matching[1]);
  } 
}

function rdio_object(url) {
  rdio.call('getObjectFromShortCode', {'short_code': url}, function(err, data){
            var result = data.result,
                newMessage = 'URL info - ';
            if (result.type === 't') { //Track
              newMessage += 'Track: "' + result.name + '"' + ' Artist: "' + result.artist +  '"' + 'Album: "' + result.album +  '"' ;
            } else if (result.type === 'a') { //Artist
              newMessage += 'Album: "' + result.name +  '"' + ' Artist: "' + result.artist + '" ' + result.length + ' tracks';
            } else if (result.type === 'p') { //Playlist
              newMessage += 'Playlist: "' + result.name + '"' + ' By: "' + result.owner + '"';
            } else if (result.type === 'r') { //Album
              newMessage += 'Artist: "' + result.artist + '"'; 
            } else if (result.type === 's') { //Person 
              newMessage += 'Profile Name: "' + result.firstName + ' ' + result.lastName;
            } else {
              newMessage += 'Uknown Type: ' + result.type;
            }
            client.say('#geekboy', newMessage);
  });
}

client.addListener('message', function(from, to, message){
  message_parsing(from, to, message);
});

client.say('#geekboy', "Hi everybody!");
