const config = require('./config');
const StaticNumbers = require('./StaticNumbers');
const Telegraf = require('telegraf')

// replace the value below with the Telegram token you receive from @BotFather
const token = config.botToken;
const bot = new Telegraf(token);
var staticCache = new StaticNumbers(); // Initialize Static numbers. 

var sendMessage = function(ctx, message) {
  ctx.replyWithHTML(message);
};

var sendHelp = function(ctx) {
  var helpMessage = "Bot programmed to be inline. Please start a message with @aczbot";
  sendMessage(ctx, helpMessage);
};

bot.help((ctx) => sendHelp(ctx));

bot.on('message', (msg) => {
  console.log('Message Received');
});

bot.on("inline_query", async ctx => {
  console.log(`Searching for ${ctx.inlineQuery.query}`);
  var searchResults = staticCache.search(ctx.inlineQuery.query);
  const result = [];
  var resultsCounter = 0;

  searchResults.some(function(value, index) {

    resultsCounter ++;

    if(resultsCounter >= 50) {
      console.log('Only 50 records can be returned. Make your search string shorter')
      return true;
    }

    var generateMessageText = function(eachObject) {
      var returnString = "";
      // TODO: Keep this formatted at cache time to avoid formatting at runtime
      Object.keys(eachObject).map(function(key) {
        returnString += key + ": " + eachObject[key] + "\n";
      });

      return returnString;
    }
    
    result.push({
        type: 'article',
        title: value.Contact,
        id: value.Contact,
        input_message_content: {
          message_text: generateMessageText(value)
        }
      }
    );
  });

  // console.log(result);
  ctx.answerInlineQuery(result, {
    cache_time: 0,
  });
});

bot.launch();