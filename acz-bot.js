module['exports'] = function echoBot (hook) {
   
    function logger(message) {
    	//sendToClient(message);
    }
    function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}
    function intercomFlats(inputText)
    {
    	
    	if(isBlank(inputText))
    	return "usage: /intercom <flatnumber> Example : /intercom AB-G01 or /intercom D-103";
	if(commonNumbers[inputText.toLowerCase()]!=undefined)  	
		return "Intercom for " + inputText + " is " + commonNumbers[inputText.toLowerCase()];
    	var splitArr = inputText.split('-');
		
		if(splitArr != null && splitArr.length == 2) {
			var blockName = splitArr[0].toUpperCase();
			var flatNumber = splitArr[1];
		  	var originalFlatNumber = flatNumber;
			logger("Querying for Block - " + blockName + " Flat Number - " + flatNumber);
			
			var intercomNumber = blockToNumberCache[blockName];
			if (intercomNumber == undefined)
			return "is this  ("+blockName+") really a block in cyberzon ?";
			
			logger("Checking Flat floor for flat number " + flatNumber + " " + typeof(flatNumber));
			// Identify ground floor flats. 
			var floor = flatNumber.charAt(0)
			if(flatNumber.substring(0, 1).toUpperCase() === "G") {
            			logger("Ground floor flat found");
				intercomNumber = intercomNumber + "0";
			} else {
				var floornum = parseInt(floor);
				if (floornum!=floornum)
				return " that is not a real flat - "+originalFlatNumber;
				if(floornum<1)
				return "Ground floor in cyberzon starts with a G";
				if (blockName =="R"&&floornum>4)
				return "Have you looked at R block? that has only 5 floors!!"
              	logger("Flat floor - " + flatNumber);
				intercomNumber = intercomNumber + flatNumber.charAt(0); // for other floors just use the string as-is 
				logger ("partial intercom number "+intercomNumber)
			}
			
			// Extract the rest of the string 
			flatNumber = flatNumber.substring(1);
			logger("Flat Number - " + flatNumber);
			var intFlat = parseInt(flatNumber);
			
			if (intFlat!=intFlat)
			return "Are you sure that this ("+originalFlatNumber+") is a flat Number? You should perhaps talk to RaviKiran";
			if(flatNumber.length>2)
				return "Are you sure that this ("+originalFlatNumber+") is a flat Number? You should perhaps talk to RaviKiran";
			if(intFlat>blockToflatsCache[blockName])
			return "you should be looking for a flat in cyberZon .. not elsewhere";
			if(intFlat<1)
			return "flat Numbers start from 1";
			intercomNumber = intercomNumber + intFlat;
			return "Intercom for " + inputText + " is " + intercomNumber;
		}
		else
		
			return "usage: /intercom <flatnumber> Example : /intercom AB-G01 or /intercom D-103";
    }
  
  	function sendToClient(message) {
      request
          .post('https://api.telegram.org/bot' + hook.env.CyberZon_bot_key + '/sendMessage')
          .form({
              "chat_id": hook.params.message.chat.id,
              "text": message
          });
    }
    
    function help()
    {
    	return "This is the cyberzon Bot. Right now it can get you intercom list. Try /intercom"
    }

var commonNumbers = {
	"apms" : "444# & 333#",
	"nextel":"999# & 901#",
	"beam" : "533#",
	"maingate" : "101# & 502#",
	"main gate" : "101# & 502#",
	"foodcourt" : "552# & 553#",
	"restaurant" : "552# & 553#",
	"servicegate" : "517#",
	"clubhouse":"555#",
	"gym":"341#",
	"mph":"550#",
	"sampoorna":"350#",
	"spa":"2366#",
	"ourkidz":"513#"
};
	var blockToNumberCache = {
		  "AB" : "22",
		  "C" : "23",
		  "D" : "31",
		  "E" : "32",
		  "F" : "33",
		  "G" : "41",
		  "H" : "42",
		  "I" : "43",
		  "J" : "51",
		  "K" : "52",
		  "L" : "53",
		  "M" : "61",
		  "N" : "62",
		  "O" : "63",
		  "P" : "71",
		  "Q" : "72",
		  "R" : "73",
		  "S" : "74",
		  "T" : "81",
		  "U" : "82"
	};
	
	var blockToflatsCache = {
		  "AB" : 10,
		  "C" : 4,
		  "D" : 3,
		  "E" : 10,
		  "F" : 8,
		  "G" : 10,
		  "H" : 10,
		  "I" : 10,
		  "J" : 10,
		  "K" : 10,
		  "L" : 10,
		  "M" : 10,
		  "N" : 10,
		  "O" : 10,
		  "P" : 10,
		  "Q" : 10,
		  "R" : 4,
		  "S" : 10,
		  "T" : 10,
		  "U" : 10
	};
  
	try {
		var request = require('request');
		var inputText = hook.params.message.text;
		var ret;
		
	        if(inputText.substring(0,1)=="/")
	        {
	                var splitCommand = inputText.split(" ")	;
			var command = splitCommand[0];	        
			splitCommand.shift();
			switch(command)
			{
				case "/intercom" : ret = intercomFlats(splitCommand.join(" "));
						break;
				case "/help" :ret = help();
						break;
				default : ret=help();
			}
			sendToClient(ret);
			return;
		} else {
			logger("Unable to understand what you sent. Please send Block-FlatNumber (ex: AB-101) \n (" + hook.params.message.text + ")");
		}
		
	} catch(ex) {
		logger("Error " + ex.message);
    }  	
};