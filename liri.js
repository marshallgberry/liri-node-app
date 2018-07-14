require("dotenv").config();

//packages required for liri
var fs = require("fs");
var twitter = require("twitter");
var spotify = require("node-spotify-api");
var request = require("request");
var keys = require("./keys.js");
var searchInput = "";

//client keys
var spotify = new spotify(keys.spotify);
var client = new twitter(keys.twitter);

//input is greater than 1 word
if (process.argv.length > 2) {
    for (var i = 3; i < process.argv.length; i++) {
        searchInput += process.argv[i] + "+";
    }
}

//twitter
var twitterCall = function() {
    var status = [];
    var twitterScreenName = {screenname: "MarshallBerry20", count: 20};
    client.get("statuses/user_timeline", twitterScreenName, function(err, tweets, response) {
        for (i = 0; i < tweets.length; i++) {
            status.push({
                "Tweet: ": tweets[i].text,
                "Created at: ": tweets[i].created_at,
        });
    }
        console.log("\nHere are the twitter responses: ");
        //prints to command line
        for (var j = 0; j < status.length; j++) {
            console.log("\nTweet " + j + ": " + JSON.stringify(status[j], null, 2));
    
            fs.appendFile("log.txt","\r" + j + ": " + JSON.stringify(status[j], null, 2) + "\r", function(err) {
                if (err) {
                    console.log(err);
                } 
            })
        }
    });
}

//spotify
var spotifyCall = function(searchInput) {
    if (searchInput == "") {
        searchInput = "LOYALTY+Kendrick+Lamar";
    }
    spotify.search({ type: 'track', query: searchInput, limit: 1}, function(err, data) {
        var songSearch = data.tracks.items[0];
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        console.log("\n=======================\n");
        console.log("Artist: " + songSearch.artists[0].name);
        console.log("Song Title: " + songSearch.name);
        console.log("Album Title: " + songSearch.album.name);
        console.log("Preview URL: " + songSearch.preview_url);
        console.log("\n=======================\n");
        var spotifyArray = [];
        fs.appendFile("log.txt","\r\r\n================Spotify Search================" + "\r\nArtist: " + songSearch.artists[0].name + "\r\nSong Title: " + songSearch.name + "\r\nAlbum Title: " + songSearch.album.name + "\r\nPreview URL: " + songSearch.preview_url, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Spotify Search saved to log.txt");
            }
        })
      });      
}

//ombd
var omdbCall = function(searchInput) {
    if (searchInput == "") {
        searchInput = "Office+Space";
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + searchInput + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function(err, response, body) {
        //rotten tomates rating
        var Movie = JSON.parse(body);
        var movieRatings = function() {
            if (JSON.parse(body).Ratings.length < 2 ) {
                console.log("Rotten Tomates Rating: No Rating Available");
            } else {
                console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            }
        }       
        if (!err && response.statusCode === 200) {
            console.log("\n=======================\n");
            console.log("Movie Title: " + Movie.Title);
            console.log("Year: " + Movie.Year);
            console.log("IMDB Rating: " + Movie.imdbRating);
            movieRatings(); //rotten tomates rating
            console.log("Country: " + Movie.Country);
            console.log("Language: " + Movie.Language);
            console.log("Actor(s): " + Movie.Actors);
            console.log("Plot: " + Movie.Plot);     
            console.log("\n=======================\n");       
        }
        if (!err && response.statusCode === 200) {
            fs.appendFile("log.txt", "\r\r\n================Movie Search================" + "\r\nTitle: " + Movie.Title + "\r\nYear: " + Movie.Year + "\r\nIMDB Rating: " + Movie.imdbRating + "\r\nCountry: " + Movie.Country + "\r\nLanguage: " + Movie.Language + "\r\nActor(s): " + Movie.Actors + "\r\nPlot: " + Movie.Plot, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Movie Info written to file");
                }
            });    
        }
    })
}
var doWhatItSays = function() {
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) {
            return console.log(err);
        }
        var outputArray = data.split(",");
        
        if (outputArray[0] == "spotify-this-song") {
            spotifyCall(outputArray[1]);
        }
    })
}

//user selector
var select = function(caseInfo) {
    switch (caseInfo) {
        case "my-tweets":
            twitterCall();
            break;
        case "spotify-this-song":
            spotifyCall(searchInput);
            break;
        case "movie-this":
            omdbCall(searchInput);
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
        default:
            console.log("Selection Unknown!");
    }
} 
//executes
var execute = function(arg1, arg2) {
    select(arg1, arg2);
}
//takes user input
execute(process.argv[2], process.argv[3]);