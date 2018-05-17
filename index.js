var express = require('express');
var session = require("express-session");
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var processMessage = require('./helpers');
var config = require('./Config');
server.listen(3000, "localhost", function () { console.log(config.environment+' Server started') });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));


app.get("/", function (req, res) {
   res.send("You visited this page times");
});



app.get('/webhook',(req,res)=>{
   const hubChallenge = req.query['hub.challenge'];
   const hubMode = req.query['hub.mode'];
    const verifyTokenMatches = (req.query['hub.verify_token'] === 'abcd');
   if (hubMode && verifyTokenMatches) {
    res.status(200).send(hubChallenge);
    } else {
    res.status(403).end();
    }
});
app.post('/webhook',function(req,resp){
   console.log('Received');
   if (req.body.object === 'page') {
   req.body.entry.forEach(entry => {
   entry.messaging.forEach(event => {
   if (event.message && event.message.text) {
       processMessage(event);
   }
   });
   });
   resp.status(200).end();
   }
});

