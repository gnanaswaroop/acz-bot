const config = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const winston = require('winston');
const https = require('https');

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({
      filename: 'combined.log',
      level: 'debug'
    })
  ]
});

// replace the value below with the Telegram token you receive from @BotFather
const token = config.botToken;

var chatId = "";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

var log = function (message) {
  console.log(message);
  logger.info(message, {timestamp: Date.now(), pid: process.pid});
}

var debugLog = function (message) {
  console.log(message);
  logger.debug(message, {timestamp: Date.now(), pid: process.pid});
}

var commonNumbers = {
  "apms": "444# & 333#",
  "nextel": "999# & 901#",
  "beam": "533#",
  "maingate": "In-gate 502# & Out-gate 101#",
  "foodcourt": "552# & 553#",
  "restaurant": "552# & 553# , 040-67485666 , 8498812449",
  "servicegate": "517#",
  "clubhouse": "555#",
  "gym": "341#",
  "mph": "550#",
  "sampoorna": "350#",
  "spa": "2366#",
  "ourkidz": "513#",
  "medplus": "505#, 507# & 040-67485689 & 8317657989",
  "ironman" : "AB Block (951585334), U Block (9441666445)",
  "E-G10": "3206#",
  "G-G10": "4105#",
  "H-G10": "4205#",
  "N-G10": "6207#",
  "P-G10": "7107#",
  "Q-G10": "7206#",
  "S-G10": "7406#",
  "U-G10": "8207#"
};

var blockToNumberCache = {
  "AB": "22",
  "C": "23",
  "D": "31",
  "E": "32",
  "F": "33",
  "G": "41",
  "H": "42",
  "I": "43",
  "J": "51",
  "K": "52",
  "L": "53",
  "M": "61",
  "N": "62",
  "O": "63",
  "P": "71",
  "Q": "72",
  "R": "73",
  "S": "74",
  "T": "81",
  "U": "82"
};

var blockToflatsCache = {
  "AB": 10,
  "C": 4,
  "D": 3,
  "E": 10,
  "F": 8,
  "G": 10,
  "H": 10,
  "I": 10,
  "J": 10,
  "K": 10,
  "L": 10,
  "M": 10,
  "N": 10,
  "O": 10,
  "P": 10,
  "Q": 10,
  "R": 4,
  "S": 10,
  "T": 10,
  "U": 10
};


var sendMessage = function(message) {
  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

var sendHelp = function() {
  var helpMessage = "Send a message with /intercom Block-Flat (ex: /intercom AB-101)";
  sendMessage(helpMessage);
}

function calcIntercomNumber(inputText) {
  if (commonNumbers[inputText.toLowerCase()] != undefined) {
    return "Intercom for " + inputText + " is " + commonNumbers[inputText.toLowerCase()];
  }

  modText = inputText.replace(/\s+/g, "");
  var flatregex = /([a-zA-Z]+)([\-]|\s+)*([gG1-9][0-9][0-9]*)$/g;
  var match = flatregex.exec(modText);
  if (match == null) {
    var a = " ";
    for (var k in commonNumbers) {
      a += k;
      a += ", ";
    }
    return "i know the numbers for these : " + a + " and can also tell you intercom for each flat";
  }

  if (match != null) {

    var blockName = match[1].toUpperCase();
    var flatNumber = match[3];
    var originalFlatNumber = flatNumber;
    log("Querying for Block - " + blockName + " Flat Number - " + flatNumber);

    var intercomNumber = blockToNumberCache[blockName];
    if (intercomNumber == undefined)
    return "is this  (" + blockName + ") really a block in cyberzon ?";

    log("Checking Flat floor for flat number " + flatNumber + " " + typeof (flatNumber));
    // Identify ground floor flats.
    if (flatNumber.trim().toUpperCase() == "SECURITY") {
      intercomNumber += "00";
      return "Intercom for " + inputText + " is " + intercomNumber;
    }


    var floor = flatNumber.charAt(0)
    if (flatNumber.substring(0, 1).toUpperCase() === "G") {
      log("Ground floor flat found");
      intercomNumber = intercomNumber + "0";
    } else {
      var floornum = parseInt(floor);
      if (floornum != floornum)
      return " that is not a real flat - " + originalFlatNumber;
      if (floornum < 1)
      return "Ground floor in cyberzon starts with a G";
      if (blockName == "R" && floornum > 4)
      return "Have you looked at R block? that has only 5 floors!!"
      log("Flat floor - " + flatNumber);
      intercomNumber = intercomNumber + flatNumber.charAt(0); // for other floors just use the string as-is
      log("partial intercom number " + intercomNumber)
    }

    // Extract the rest of the string
    flatNumber = flatNumber.substring(1);
    log("Flat Number - " + flatNumber);
    var intFlat = parseInt(flatNumber);

    if (intFlat != intFlat)
    return "Are you sure that this (" + originalFlatNumber + ") is a flat Number? You should perhaps talk to Aparna";
    if (flatNumber.length > 2)
    return "Are you sure that this (" + originalFlatNumber + ") is a flat Number? You should perhaps talk to Aparna";
    if (intFlat > blockToflatsCache[blockName])
    return "you should be looking for a flat in cyberZon .. not elsewhere";
    if (intFlat < 1)
    return "flat Numbers start from 1";
    intercomNumber = intercomNumber + intFlat;
    return "Intercom for " + inputText + " is " + intercomNumber;
  } else

  return "usage: /intercom <flatnumber> Example : /intercom AB-G01 or /intercom D-103";
}

bot.onText(/\/intercom (.+)/, (msg, match) => {

  chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  sendMessage(calcIntercomNumber(match[1]));

});

bot.onText(/\/help/, (msg, match) => {
  chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  sendHelp();
});

bot.on('message', (msg) => {
  chatId = msg.chat.id;
  const message = msg.text;

  try {
    if(!message.startsWith('/intercom')) {
      log(message + "  not found, send help");
      sendHelp();
      return;
    }
  } catch(ex) {
    log("Error observed " + ex);
  }
});
