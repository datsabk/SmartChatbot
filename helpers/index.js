var config = require('../Config');
const FACEBOOK_ACCESS_TOKEN = config.fbPageToken;
const request = require('request');
const senderIntentMap = [];
const senderContextMap = [];
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var conversation = new ConversationV1({
    username: config.wsServiceId,
    password: config.wsServicePwd,
    version: '2017-05-26'
  });
const sendTextMessage = (senderId, text) => {
    console.log('Sending '+text+' to '+senderId);
request({
url: 'https://graph.facebook.com/v2.6/me/messages',
qs: { access_token: FACEBOOK_ACCESS_TOKEN },
method: 'POST',
json: {
recipient: { id: senderId },
message: { text },
}
});
};
const sendQuickReply = (senderId,replies,title)=>{
   request({
       url: 'https://graph.facebook.com/v2.6/me/messages',
       qs: { access_token: FACEBOOK_ACCESS_TOKEN },
       method: 'POST',
       json: {
       recipient: { id: senderId },
       message: { "text": title,
       "quick_replies":replies},
       }
       });
};
module.exports = (event) => {
   console.log('Event called');
let senderId = event.sender.id;
let message = event.message.text;
let context = senderContextMap[senderId]!=undefined?senderContextMap[senderId]:'';
sendMessageToWatson(message,context,senderId).then((resp)=>{
    sendTextMessage(senderId,resp);
}).catch((e)=>{
    console.log('Error:'+e.message);
});
};

var sendMessageToWatson = function(text, context,senderId) {
    var payload = {
      workspace_id: config.wsWsId,
      input: {
        text: text
      }
    };
    if(context!=''){
        payload.context= context
    }
    return new Promise((resolve, reject) =>
      conversation.message(payload, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log(JSON.stringify(data.output.text[0]));  
          if(data.intents.length>0){
              senderIntentMap[senderId]= data.intents[0];
          }
          senderContextMap[senderId] = data.context;
          resolve(data.output.text[0]);
        }
      })
    );
  };


