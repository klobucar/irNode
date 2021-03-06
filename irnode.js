console.log('Starting irNode');

var irc = require('irc'),
    U = require('underscore'),
    request = require('request'),
    querystring = require('querystring'),
    Echo = require('echonest')
    Rdio = require('./rdio'),
    cred = require('./rdio_cred'),
    myBot = {
      'server': 'dot.cclub', 
      'nick': 'irNode', 
      'channel': '#geekboy' 
    },
    client = new irc.Client(myBot.server, myBot.nick, {
      channels: [myBot.channel],
      userName: myBot.nick,
      realName: 'Hey A-bot'
    });


var rdio = new Rdio([cred.RDIO_CONSUMER_KEY, cred.RDIO_CONSUMER_SECRET]);
var echonest = new Echo.Echonest({ api_key: cred.ECHONEST_APIKEY});

client.join(myBot.channel);
client.on('error', function(e) { console.log('Error: ' + e ); })

function message_parsing(from, to, message) {
  var rdioText = message.match(/\bhttp\:\/\/rd\.io\/x\/([0-9\w\-]+)\b/),
      acText = message.match(/^!ac[ \t]+([0-9]{3})$/),
      rollCall = message.match(/^bot\ roll\ call[!?]*?$/i),
      similar = message.match(/^!similar\ ([^\r\n]*)/i);
  if (rdioText) {
    rdioObject(rdioText[1]);
  } else if (acText) {
    acLookup(acText[1]); 
  } else if (rollCall) {
    client.say(myBot.channel, "Node.js extordinar! My source is here: j.mp/PN06GL");
  } else if (similar) {
    echoSimilar(similar[1]);
  }
}

function rdioObject(url) {
  rdio.call('getObjectFromShortCode', {'short_code': url}, function(err, data) {
    var result = data.result,
        newMessage = 'URL info - ';
    if (result.type === 't') { //Track
      newMessage += 'Track: "' + result.name + '"' + ' Artist: "' + result.artist +  '"' + ' Album: "' + result.album +  '"' ;
    } else if (result.type === 'a') { //Artist
      newMessage += 'Album: "' + result.name +  '"' + ' Artist: "' + result.artist + '" ' + result.length + ' tracks';
    } else if (result.type === 'p') { //Playlist
      newMessage += 'Playlist: "' + result.name + '"' + ' By: "' + result.owner + '"';
    } else if (result.type === 'r') { //Album
      newMessage += 'Artist: "' + result.name + '"'; 
    } else if (result.type === 's') { //Person 
      newMessage += 'Profile Name: "' + result.firstName + ' ' + result.lastName + '"';
    } else {
      newMessage += 'Uknown Type: ' + result.type;
    }
      client.say(myBot.channel, newMessage);
  });
}
function acLookup(areaCode) {
  var qs = querystring.stringify({
      'npa': areaCode,
      'tracking_email': 'exmaple@example.com',
      'tracking_url': 'http://github.com/klobucar/irNode'  
      }),    
    newMessage = 'Area Code is in: ',
    httpString = "http://www.allareacodes.com/api/1.0/api.json?";
  
  httpString += qs; 
  request(httpString, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonResponse = JSON.parse(body),
        areaCode = jsonResponse.area_codes[0];
      if (typeof(areaCode) != 'undefined' && areaCode.state) { 
        newMessage += areaCode.state;
        client.say(myBot.channel, newMessage);
      }
    }
  });
}
function echoSimilar(artistNames) {
  var artistList = artistNames.split('&&');
  echonest.artist.similar( 
    {name: artistList, results: 5}, 
    function(err, res) {
      newMessage = 'Similar artists are: ("'+ U.pluck(res.artists, 'name').join('", "') + '")';
      client.say(myBot.channel, newMessage);      
    }
  )
 
}

client.addListener('message', function(from, to, message){
  message_parsing(from, to, message);
});

client.say(myBot.channel, "Hi everybody!");
